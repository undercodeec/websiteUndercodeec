// Import the saved Dala reference and make its asset paths portable.
// Run with: node scripts/prepare-dala-demo.mjs
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('saveweb2zip-com-dala-craftedbygc-com');
const target = resolve('public/demos/dala');
await mkdir(target, { recursive: true });
for (const folder of ['css', 'fonts', 'images']) {
  await cp(resolve(source, folder), resolve(target, folder), { recursive: true });
}
await mkdir(resolve(target, 'js'), { recursive: true });
for (const name of ['manifest.js', 'vendor.js']) {
  await cp(resolve(source, 'js', name), resolve(target, 'js', name));
}
const theme = (await readFile(resolve(source, 'js/theme.js'), 'utf8'))
  .replaceAll('"/images/', '"/demos/dala/images/')
  .replaceAll('"/models/', '"/demos/dala/models/');
await writeFile(resolve(target, 'js/theme.js'), theme);

const sourceHtml = (await readFile(resolve(source, 'index.html'), 'utf8'))
  // The demo does not share the original site's analytics accounts.
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, tag =>
    /src="js\/(manifest|vendor|theme)\.js"/.test(tag) ? tag : '')
  .replace('<title>Dala</title>', '<title>Dala · Demo | Undercodeec</title><meta name="robots" content="noindex, nofollow">')
  .replace(/<meta name="msapplication-config"[^>]*>/, '')
  .replace('href="/privacy"', 'href="https://dala.craftedbygc.com/privacy"')
  .replace('href="/terms"', 'href="https://dala.craftedbygc.com/terms"');

const translations = [
  ['<html lang="en">', '<html lang="es">'],
  ['Your workplace has the answer. Just ask Dala for it.', 'Tu lugar de trabajo tiene la respuesta. Solo pregúntale a Dala.'],
  ['Your workplace has the answer.', 'Tu lugar de trabajo tiene la respuesta.'],
  ['The Dala logo above the headline ', 'El logo de Dala sobre el titular '],
  ['Unlock collective wisdom', 'Desbloquea la sabiduría colectiva'],
  [' sitting on top of a 3d brain composed many small pyramidal particles.', ' sobre un cerebro 3D formado por pequeñas partículas piramidales.'],
  ['Toggle Mobile Navigation', 'Alternar navegación móvil'],
  ['Request Access', 'Solicitar acceso'],
  ['Request access', 'Solicitar acceso'],
  ['Manifesto', 'Manifiesto'],
  ['Team', 'Equipo'],
  ['Blog', 'Blog'],
  ['Cookie consent', 'Consentimiento de cookies'],
  ['This website uses cookies. ', 'Este sitio web utiliza cookies. '],
  ['Learn more', 'Más información'],
  [' about how we use Cookies', ' sobre cómo usamos las cookies'],
  ['Accept', 'Aceptar'],
  ['Ask Dala to find it.', 'Pídele a Dala que la encuentre.'],
  ['LOADING', 'CARGANDO'],
  ['Completed', 'Completado'],
  ['Unlock', 'Desbloquea'],
  ['collective', 'la sabiduría'],
  ['wisdom.', 'colectiva.'],
  ['Stop managing knowledge. Start using it.', 'Deja de gestionar el conocimiento. Empieza a utilizarlo.'],
  ['Plug into your team’s shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system. Focus on doing your best work with context, conviction and clarity.', 'Conéctate a la inteligencia compartida de tu equipo. Pide a Dala que encuentre al instante cualquier información o persona en los sistemas de tu lugar de trabajo. Concéntrate en hacer tu mejor trabajo con contexto, confianza y claridad.'],
  ['Make decisions with confidence', 'Toma decisiones con confianza'],
  ['Dala’s bleeding-edge AI search tool automates extracting knowledge from across your organisation so that you can take the guesswork out of your work.', 'La avanzada herramienta de búsqueda con IA de Dala automatiza la extracción de conocimiento de toda tu organización para que puedas eliminar las suposiciones de tu trabajo.'],
  ['This is your workplace today. Countless fragments of critical knowledge scattered across hundreds of disparate systems.', 'Así es tu lugar de trabajo hoy: incontables fragmentos de conocimiento esencial dispersos en cientos de sistemas diferentes.'],
  ['30% of your time is spent trying to organise and find the information and expertise you need to do your job.', 'El 30 % de tu tiempo se dedica a organizar y encontrar la información y experiencia que necesitas para hacer tu trabajo.'],
  ['The impossible battle to make sense of this chaos leaves your team feeling overwhelmed and unproductive.', 'La batalla imposible por dar sentido a este caos hace que tu equipo se sienta abrumado e improductivo.'],
  ['They’re confronted with the anxiety of bothering a busy coworker again, or aimlessly trying to connect the dots with incomplete context.', 'Se enfrentan a la ansiedad de volver a molestar a un compañero ocupado o de intentar conectar los puntos sin rumbo y con un contexto incompleto.'],
  ['Existing solutions are cumbersome and quickly become outdated. Yet another decaying system that requires continuous maintenance.', 'Las soluciones existentes son engorrosas y se vuelven obsoletas rápidamente. Otro sistema en deterioro que requiere mantenimiento continuo.'],
  ['They fail to understand what you need from the vast amounts of information that your team creates every day.', 'No comprenden lo que necesitas de la enorme cantidad de información que tu equipo crea cada día.'],
  ['Spark lightbulb moments', 'Genera momentos de claridad'],
  ['Dala is your intelligent, real-time source of truth that eliminates the cultural, financial and operational struggles of splintered tools.', 'Dala es tu fuente inteligente y en tiempo real de información confiable, que elimina las dificultades culturales, financieras y operativas de las herramientas fragmentadas.'],
  ['We connect your systems behind the scenes and pull together exactly the knowledge you require into an elegant contextual view.', 'Conectamos tus sistemas entre bastidores y reunimos exactamente el conocimiento que necesitas en una elegante vista contextual.'],
  ['Just ask Dala for the answer that advances your work, and helps you make better decisions with more confidence.', 'Solo pide a Dala la respuesta que impulsa tu trabajo y te ayuda a tomar mejores decisiones con más confianza.'],
  ['Build a better world of work', 'Construye un mundo laboral mejor'],
  ['Our mission is to make work more coherent and delightful—reframing productivity from ', 'Nuestra misión es hacer que el trabajo sea más coherente y agradable, redefiniendo la productividad: de '],
  ['doing more', 'hacer más'],
  ['being better', 'trabajar mejor'],
  ['Your happiest and most purposeful moments at work are when you’re in flow, intellectually stimulated, and creating value for customers.', 'Tus momentos más felices y valiosos en el trabajo ocurren cuando estás concentrado, intelectualmente estimulado y creando valor para los clientes.'],
  ['We want to recreate that every time you experience Dala. A tool that is completely integrated with how you think, feel and work.', 'Queremos recrear esa sensación cada vez que uses Dala: una herramienta totalmente integrada con tu forma de pensar, sentir y trabajar.'],
  ['Our team', 'Nuestro equipo'],
  ['Co Founder &amp; CEO', 'Cofundador y CEO'],
  ['Product Design Lead', 'Líder de diseño de producto'],
  ['Co Founder &amp; CTO', 'Cofundador y CTO'],
  ['Previous', 'Anterior'],
  ['Next', 'Siguiente'],
  ['Build with us.', 'Construye con nosotros.'],
  ["We are actively hiring intentional, empathetic and curious people who thrive on creating delightful experiences. If you'd like to be a part of the journey, email ", 'Buscamos activamente personas intencionales, empáticas y curiosas que disfruten creando experiencias memorables. Si quieres formar parte de este camino, escribe a '],
  [" with your CV or portfolio, and a thoughtful note.", ' con tu CV o portafolio y una nota personal.'],
  ['Read more about our values ', 'Lee más sobre nuestros valores '],
  ['Co-founder of Funding Circle', 'Cofundador de Funding Circle'],
  ['Co-founder &amp; CPO at Personio', 'Cofundador y CPO de Personio'],
  ['Our investors', 'Nuestros inversionistas'],
  ["We are supported by some of the world's most pioneering operators and progressive funds to fuel our growth.", 'Contamos con el respaldo de algunos de los operadores y fondos más innovadores del mundo para impulsar nuestro crecimiento.'],
  ['All rights reserved.', 'Todos los derechos reservados.'],
  ['Privacy', 'Privacidad'],
  ['Terms', 'Términos'],
  ['Email', 'Correo electrónico'],
];
const html = translations.reduce((document, [english, spanish]) => document.replaceAll(english, spanish), sourceHtml)
  .replaceAll('>here<', '>aquí<')
  .replaceAll('> to <', '> para <')
  .replace(/<meta property="og:image:alt"[\s\S]*?<meta property="og:image:width"/, '<meta property="og:image:alt" content="El logo de Dala sobre el titular Desbloquea la sabiduría colectiva, acompañado por un cerebro 3D formado por pequeñas partículas piramidales."><meta property="og:image:width"')
  .replace(/<meta name="twitter:image:alt"[\s\S]*?<link rel="apple-touch-icon"/, '<meta name="twitter:image:alt" content="El logo de Dala sobre el titular Desbloquea la sabiduría colectiva, acompañado por un cerebro 3D formado por pequeñas partículas piramidales."><link rel="apple-touch-icon"');
await writeFile(resolve(target, 'index.html'), html);
const manifest = JSON.parse(await readFile(resolve(source, 'site.webmanifest'), 'utf8'));
manifest.start_url = './index.html';
manifest.scope = './';
manifest.icons = [{ src: 'images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }];
await writeFile(resolve(target, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

const resources = [...new Set([...theme.matchAll(/"\/demos\/dala\/((?:images|models)\/[^"?]+)"/g)].map(match => match[1]))];
await Promise.all(resources.map(async resource => {
  const response = await fetch(`https://dala.craftedbygc.com/${resource}`);
  if (!response.ok) throw new Error(`${resource}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.headers.get('content-type')?.includes('text/html')) {
    throw new Error(`${resource}: server returned HTML instead of an asset`);
  }
  await mkdir(resolve(target, resource, '..'), { recursive: true });
  await writeFile(resolve(target, resource), bytes);
  console.log(`${resource}: ${bytes.length} bytes`);
}));
console.log('Dala demo prepared at public/demos/dala/index.html');
