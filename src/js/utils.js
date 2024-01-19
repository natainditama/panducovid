import $ from "jquery";

export function formatDate(timestamp) {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const date = new Date(timestamp);
  const day = days[date.getDay()];
  const month = months[date.getMonth()];

  return `${day}, ${date.getDate()} ${month} ${date.getFullYear()}`;
}

export function splitNumber(element, separator = ".") {
  const textLength = $(element).text().length;

  if (textLength > 6) {
    const firstPart = $(element)
      .text()
      .slice(0, textLength - 6);
    const middlePart = $(element)
      .text()
      .slice(textLength - 6, textLength - 3);
    const lastPart = $(element)
      .text()
      .slice(textLength - 3, textLength);

    $(element).text(
      `${firstPart}${separator}${middlePart}${separator}${lastPart}`,
    );
  } else if (textLength > 3) {
    const lastPart = $(element)
      .text()
      .slice(textLength - 3, textLength);
    const firstPart = $(element)
      .text()
      .slice(0, textLength - 3);

    $(element).text(`${firstPart}${separator}${lastPart}`);
  } else {
    $(element).text(0);
  }
}

export function getMouseDirection(event, prevX, prevY) {
  let direction;

  if ($(window).width() > 768) {
    direction =
      event.pageX > prevX ? "left" : event.pageX < prevX ? "right" : direction;
  } else {
    direction =
      event.pageY < prevY ? "down" : event.pageY > prevY ? "up" : direction;
  }

  return direction;
}

export function sortTime(array = [], key, order) {
  return array.sort(function (a, b) {
    return order === "asc"
      ? new Date(a[key]) - new Date(b[key])
      : new Date(b[key]) - new Date(a[key]);
  });
}

export function sliceString(str, length) {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}
