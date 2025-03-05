const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // 'public' — папка со статическими файлами

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465, // 465 / maybe 587
  secure: true,
  auth: {
    user: 'kassert.kdcert', //kassert.kdcert@yandex.ru
    pass: 'tbtcutdwpiefyyst',
  }
});

app.get('/', (_request, response) => {
  res.sendFile(__dirname + '/index.html');
});

// Маршрут для отправки письма
app.post('/send-email', (request, response) => {
  const { emails, subject, htmlContent } = request.body;
  const mailOptions = {
    from: '"Команда ТНК" <kassert.kdcert@yandex.ru>',
    to: emails.join(', '), // Список адресов
    replyTo: 'kassert.kdcert@yandex.ru', // Адрес для ответа
    subject: subject,
    html: htmlContent,
    text: 'Сертификация товаров и услуг в г. Сургут и в Тюменской области. Если ваша компания занимается производством, предусмотрены специальные предложения, которые позволят сэкономить и ускорить процесс сертификации.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Ошибка: отправки email:', error);
      if (error.responseCode === 553) {
        return response.status(400).send('Ошибка: Адрес отправителя или получателя неверный.');
      } else if (error.responseCode === 550) {
        console.log('error 550', error)
        return response.status(400).send('Ошибка: Почтовый ящик получателя не существует.');
      } else {
        return response.status(500).send('Неизвестная ошибка: ' + error.message);
      }
    } else {
      return response.status(200).send('Письмо успешно отправлено: ' + info.response);
    }
  });
});

app.use((_request, response) => {
  response.status(404).sendFile([__dirname, 'public'].join('/') + '/404.html');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// ------------

// const sendEmail = (email) => {
//   console.log('sendEmail')
//   return new Promise((resolve, reject) => {
//     console.log('Promise start sendEmail')

//     const mailOptions = {
//       from: '"Команда ТНК" <kassert.kdcert@yandex.ru>',
//       to: email, // Адрес получателя
//       replyTo: 'kassert.kdcert@yandex.ru', // Адрес для ответа
//       subject: subject,
//       html: htmlContent,
//       text: 'Сертификация товаров и услуг в г. Сургут и в Тюменской области. Если ваша компания занимается производством, предусмотрены специальные предложения, которые позволят сэкономить и ускорить процесс сертификации.'
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       console.log('Promise start transporter sendEmail')

//       if (error) {
//         reject(`Ошибка при отправке письма ${email}: ${error}`);
//       } else {
//         resolve(`Письмо отправлено ${email}: ${info.response}`);
//       }
//     });
//   })

// };



// const sendAllEmailsWithDelay = async (emails, delay = 5 * 1000) => {
//   for (const email of emails) {
//     try {
//       const result = await sendEmail(email);
//       console.log(result);
//     } catch (error) {
//       console.error(error);
//     }
//     await new Promise(resolve => setTimeout(resolve, delay)); // Задержка
//   }
// };

// sendAllEmailsWithDelay(emails);