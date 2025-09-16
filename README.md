## 專案概述

notifier 是一個以 NestJS 建立的郵件發送微服務範例。主要職責為接收 HTTP 請求（目前以 MJML 為主），將 MJML 轉為 HTML 後透過 Nodemailer 傳送郵件。專案同時產生 Swagger 規格檔（`swagger-spec.json`）並在 `/api` 提供 Swagger UI。

## 主要功能

- 提供 HTTP API：POST /mail/mjml
- 將傳入的 MJML 程式碼轉為 HTML（使用 `mjml` 套件）
- 使用 `@nestjs-modules/mailer`（底層為 `nodemailer`）透過 SMTP 傳送郵件
- 支援批次發送（每批次上限 20 封）並回傳成功/失敗統計

## 主要檔案與模組

- `src/main.ts`：啟動 Nest 應用，設定 Swagger，並將 Swagger JSON 寫入專案根目錄的 `swagger-spec.json`；預設監聽埠 3000。
- `src/app.module.ts`：全域載入 `ConfigModule` 並匯入 `MailModule`。
- `src/mail/mail.module.ts`：以 `MailerModule.forRootAsync` 初始化郵件模組，使用 `mail.config` 提供的設定。
- `src/mail/mail.config.ts`：從環境變數讀取郵件設定（host, port, username, password, from），並根據 `NODE_ENV` 決定 `templateDir` 路徑。
- `src/mail/mail.controller.ts`：定義路由 `POST /mail/mjml`，接收 `SendMjmlDto`。
- `src/mail/mail.service.ts`：實作發郵件邏輯，包含批次處理、錯誤記錄、呼叫 `MailerService.sendMail`。
- DTOs：
	- `src/mail/send-mail.dto.ts`：抽象型別，定義 `subject`, `tag`, `from?`, `receivers[]` 與 `toMailOptions()` 抽象方法。
	- `src/mail/send-mjml.dto.ts`：擴充 `SendMailDto`，加入 `mjmlCode` 與 `context`，並實作 `toMailOptions()`；使用 `mjml2html` 產生 HTML。

## API 介面

- POST /mail/mjml
	- Request body（JSON）: 參考 `SendMjmlDto`，主要欄位：
		- `subject` (string)
		- `tag` (string)
		- `from` (string, optional)
		- `receivers` (array of { email: string, username?: string })
		- `mjmlCode` (string)
		- `context` (object, optional)
	- 行為：將 `mjmlCode` 轉為 HTML，為每個 receiver 產生一組 `ISendMailOptions`，以每批 20 封為單位發送。
	- 回傳範例（實際由 `MailService.sendRequest` 回傳）：
		- `{ total: number, success: number, error: number, errorEmail: [...] }`

## 環境變數

- `MAIL_HOST`：SMTP 主機
- `MAIL_PORT`：SMTP 埠（預設 587）
- `MAIL_USERNAME`：SMTP 帳號
- `MAIL_PASSWORD`：SMTP 密碼
- `MAIL_FROM`：預設寄件者地址
- `NODE_ENV`：若以 `.toString().endsWith('local')` 為真，`templateDir` 會使用專案工作目錄下的 `src/mail/templates`，否則使用編譯後的 `__dirname/mail/templates`。

## 郵件傳遞行為細節

- `mail.module` 建立的 transporter 設定為：
	- `host`、`port` 從 `mail.config` 取得
	- `secure: false`
	- `auth.user`、`auth.pass` 對應 `username` / `password`
- `MailService.sendRequest`：將 `toMailOptions()` 產出的陣列切塊（chunk）為 batch size 20，對每個 batch 以 `Promise.all` 並行呼叫 `sendMail`。
- `MailService.sendMail`：直接呼叫 `this.mailerService.sendMail(options)`，若發生例外則在 catch 中記錄（console.log）。

## 套件相依

- 主要相依：`@nestjs/*` (core, common, platform-express, config, swagger), `@nestjs-modules/mailer`, `nodemailer`, `mjml`, `handlebars`, `lodash`, `class-validator`, `class-transformer`。
- 開發相依（測試/工具）：`jest`, `ts-jest`, `supertest`, `eslint`, `prettier`, `ts-node` 等。

## pnpm 腳本

- `pnpm run start`：`nest start`（啟動應用）
- `pnpm run start:dev`：`nest start --watch`（開發 hot-reload）
- `pnpm run start:prod`：執行 `node dist/main`
- `pnpm run build`：`nest build`
- `pnpm test`：`jest`（單元測試）
- `pnpm run test:e2e`：`jest --config ./test/jest-e2e.json`

## 測試設定

- `package.json` 中 `jest` 設定：
	- `rootDir`: `src`
	- `testRegex`: `.*\.spec\.ts$`
	- 使用 `ts-jest` 轉譯 TypeScript

## 其他說明

- 啟動時會將 Swagger 文件寫入 `./swagger-spec.json`（由 `src/main.ts`）。
- 專案 license 欄位為 `UNLICENSED`，`author` 與 `description` 目前留空。

