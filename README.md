# 6.py 金融平台 Web 端

一个可直接发布到 GitHub Pages 的静态金融前端示例，内置以下页面路径：

- `/login/`
- `/quotes/`
- `/portfolio/`
- `/trade/`
- `/transfer/`
- `/statements/`

## 本地预览

```bash
python3 -m http.server 8080
```

然后打开 `http://127.0.0.1:8080/`。

## 发布

推送到 `main` 后，GitHub Actions 会自动把当前仓库发布到 GitHub Pages。

线上地址：

- [https://xuzhidong-netizen.github.io/6.py/](https://xuzhidong-netizen.github.io/6.py/)

## 页面说明

- 登录页：演示账号登录和会话状态
- 行情页：展示自选行情和市场脉冲
- 持仓页：展示账户资产、持仓分布和收益
- 交易页：演示买卖委托录入和预览
- 转账页：演示资金划转和回执
- 账单页：展示月度账单和流水摘要
