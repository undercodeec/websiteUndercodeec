# Opt-in local OTP tests against a NEW loopback MariaDB. Never use shared data.
$ErrorActionPreference = 'Stop'
$names = @('CRM_OTP_TEST_DB', 'CRM_OTP_TEST_PORT', 'CRM_OTP_TEST_USER', 'CRM_OTP_TEST_PASSWORD')
foreach ($key in $names) {
  if ([Environment]::GetEnvironmentVariable($key, 'Process')) {
    throw "Refusing to override $key. Open a fresh local shell."
  }
}
$hex = [Guid]::NewGuid().ToString('N')
$database = "crm_otp_test_$hex"
$name = "crm-otp-test-$($hex.Substring(0, 12))"
$password = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N')
$rootPassword = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N')
$backend = Split-Path -Parent $PSScriptRoot
$started = $false
try {
  docker info --format '{{.ServerVersion}}' *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Local Docker is required.' }
  docker run --rm -d --name $name -e "MARIADB_ROOT_PASSWORD=$rootPassword" -e "MARIADB_PASSWORD=$password" -e 'MARIADB_USER=crm_otp_test' -e "MARIADB_DATABASE=$database" -p '127.0.0.1::3306' mariadb:11.4 *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Disposable MariaDB failed to start.' }
  $started = $true
  $mapping = docker port $name '3306/tcp'
  if ($LASTEXITCODE -ne 0 -or $mapping -notmatch '^127\.0\.0\.1:(\d+)\s*$') {
    throw 'Expected a loopback-only MariaDB port.'
  }
  $port = $Matches[1]
  $ready = $false
  for ($attempt = 0; $attempt -lt 90; $attempt++) {
    $ErrorActionPreference = 'Continue'
    docker exec -e "MYSQL_PWD=$password" $name mariadb -u crm_otp_test -D $database -N -e 'SELECT 1' *> $null
    $dbReady = $LASTEXITCODE -eq 0
    $ErrorActionPreference = 'Stop'
    if ($dbReady) { $ready = $true; break }
    Start-Sleep -Milliseconds 600
  }
  if (-not $ready) { throw 'Disposable MariaDB did not become ready.' }
  $env:CRM_OTP_TEST_DB = $database
  $env:CRM_OTP_TEST_PORT = $port
  $env:CRM_OTP_TEST_USER = 'crm_otp_test'
  $env:CRM_OTP_TEST_PASSWORD = $password
  Push-Location $backend
  try {
    & npm.cmd run test:crm-auth
    if ($LASTEXITCODE -ne 0) { throw 'CRM OTP suite failed.' }
    Write-Host 'OTP tests passed on disposable local MariaDB.'
  } finally { Pop-Location }
} finally {
  foreach ($key in $names) { Remove-Item "Env:$key" -ErrorAction SilentlyContinue }
  if ($started) { docker rm -f $name *> $null }
  Write-Host 'Disposable MariaDB removed.'
}
