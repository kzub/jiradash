# Jira dashboard

Для поднятия монитора локально просто запускаем `docker-compose up` и открываем http://localhost.

Предварительно нужно создать в папке docker файл nginx.env такого содержимого:

	JIRA_AUTH=[auth]

[auth] - строка в авторизационном заголовке к Jira после слова Basic.
