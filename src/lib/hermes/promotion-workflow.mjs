export async function updatePromotionAndVerify(api, priceList, isActive) {
  if (!priceList?.isPromotion || !priceList.id) {
    throw new Error('Solo se pueden cambiar promociones desde esta sección.');
  }
  if (typeof isActive !== 'boolean') {
    throw new Error('El estado solicitado no es válido.');
  }
  await api.updatePriceListStatus(priceList.id, isActive);
  const persisted = await api.priceList(priceList.id);
  if (persisted?.id !== priceList.id || persisted.isPromotion !== true || persisted.isActive !== isActive) {
    throw new Error('No se pudo verificar el estado guardado. Actualiza la lista antes de volver a intentarlo.');
  }
  return persisted;
}
