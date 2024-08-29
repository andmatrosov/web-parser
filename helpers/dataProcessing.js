function processCarData(rawCarData) {
  // Здесь можно добавить любую обработку данных, например:
  // - Преобразование форматов
  // - Проверка корректности данных
  // - Преобразование строк в числа или другие типы данных
  // - Нормализация данных (например, привести все строки к нижнему регистру)

  const processedData = { ...rawCarData };

  // Пример: преобразование строки цены в число
  processedData.price = processedData.price.replace(/[^\d.-]/g, '');

  // Другие преобразования по необходимости...

  return processedData;
}

module.exports = { processCarData };