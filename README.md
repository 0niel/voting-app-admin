# voting-app-admin

Админ-панель [приложения](https://github.com/mirea-ninja/face-to-face-voting-app) для отчётно-выборных конференций студенческого союза РТУ МИРЭА.

## Конференции

- [ОВК ИИТ](https://vk.com/wall-78724646_1219)
- [ОВК КПК](https://vk.com/wall-78724646_1298)
- [ОВК ИИИ](https://vk.com/wall-78724646_1306)
- [ОВК ИПТИП](https://vk.com/wall-78724646_1364)
- [ОВК ИТХТ им. М. В. Ломоносова](https://vk.com/wall-78724646_1343)
- [ОВК ИРИ](https://vk.com/wall-78724646_1397)
- [ОВК ИТУ](https://vk.com/wall-78724646_1436)
- [ОВК ИКБ](https://vk.com/wall-78724646_1458)

## Скриншоты

<p float="left">
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224476782-a0d34885-81c7-40d5-85e1-f2c197043acd.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224476886-17b50ea0-9cd5-4885-a209-c028b7002915.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224476999-59715b76-536b-4352-9ff6-4267f9cf8c1b.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224477020-ec04673f-e927-4785-932a-c90e676e9dd7.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224477458-e4fcaac6-b50f-4cf3-b1fa-5d0b8ca73049.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224477549-7b27be83-ef33-4384-9aa4-3351129a8503.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224477371-5308b9dd-9231-4480-a62c-1e6edf4aeb27.png"/>
  <img width="300" src="https://user-images.githubusercontent.com/70258211/224478024-0602e20d-6fff-4518-86b7-8dd0758a7dd3.png">
</p>

## Сборка проекта

### В режиме разработки

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Проект запустится на http://127.0.0.1:3000.

### На проде

```bash
docker build -t voting-app-admin . && docker run -p 127.0.0.1:3000:3000 voting-app-admin
```
