const excel = require('excel4node');
const fs = require('fs');

function createSheet(sheetName, carsInfo) {
   const workbook = new excel.Workbook();
   const worksheet = workbook.addWorksheet('Sheet 1');

  // Заголовки таблицы
  const headings = [
    'Ссылка', 'Марка', 'Модель', 'Цена', 'Пробег', 'Год выпуска', 'Тип двигателя',
    'Мощность двигателя', 'Тип кузова', 'Цвет',
    'Коробка передач', 'Объем двигателя', 'Расход', 'Привод', 'ссылка на Фото'
  ];

// Стили для таблиц
   const style = workbook.createStyle({
     font: {
       color: '#000000',
       size: 12
     },
     numberFormat: '$#,##0.00; ($#,##0.00); -'
   });
   const styleHeadings = workbook.createStyle({
     font: {
       color: '#000000',
       size: 14
     },
     numberFormat: '$#,##0.00; ($#,##0.00); -'
   });

  headings.forEach((heading, index) => {
    worksheet.cell(1, index + 1).string(heading).style(styleHeadings);
  });

  carsInfo.forEach((car, index) => {
    worksheet.cell(index + 2, 1).string(car.carLink).style(style);
    worksheet.cell(index + 2, 2).string(car.mark).style(style);
    worksheet.cell(index + 2, 3).string(car.model).style(style);
    worksheet.cell(index + 2, 4).string(car.price).style(style);
    worksheet.cell(index + 2, 5).string(car.run).style(style);
    worksheet.cell(index + 2, 6).string(car.year).style(style);
    worksheet.cell(index + 2, 7).string(car.engine).style(style);
    worksheet.cell(index + 2, 8).string(car.horsePower).style(style);
    worksheet.cell(index + 2, 9).string(car.bodyType).style(style);
    worksheet.cell(index + 2, 10).string(car.color).style(style);
    worksheet.cell(index + 2, 11).string(car.transmission).style(style);
    worksheet.cell(index + 2, 12).string(car.displacement).style(style);
    worksheet.cell(index + 2, 13).string(car.fuel).style(style);
    worksheet.cell(index + 2, 14).string(car.driveType).style(style);
    worksheet.cell(index + 2, 15).string(car.images).style(style);
  });

  workbook.write(`${sheetName}_${new Date().getTime()}.xlsx`);
}


function saveCarLinks(sheetName, carLinks) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  carLinks.forEach((link, index) => {
    worksheet.cell(index + 2, 1).string(link);
  });

  workbook.write(`${sheetName}_${new Date().getTime()}.xlsx`);
}

module.exports = {createSheet, saveCarLinks}