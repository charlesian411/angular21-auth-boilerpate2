

---

## Hosting my Database

I used Clever Cloud's free **MySQL environment** to host my project database.

*URL: [https://console.clever-cloud.com/](https://console.clever-cloud.com/)*

First, go to the Clever Cloud dashboard and log in to your account. Once you are inside the dashboard, create a new service and select **MySQL** as your database type.

![Clever Cloud Dashboard](images/image1.png)

After selecting MySQL, choose the **DEV** option. Then, scroll down to the bottom of the page and click the **Next** button.

![MySQL DEV Option](images/image2.png)

Select "Montreal Canada" region and name your database.

![Region and Database Name](images/image3.png)

Once the database creation is successful, Clever Cloud will automatically redirect you to the **phpMyAdmin dashboard**. This is where you can manage your database tables, import SQL files, and monitor your data.

![phpMyAdmin Dashboard](images/image4.png)

---

## Deploying the Backend on Render

First, open the Render dashboard. Inside the dashboard, click the **NEW** dropdown button and select **Web Service**.

![Render Dashboard - New Web Service](images/image5.png)

After that, connect your GitHub repository to Render. Choose the repository that contains your backend source code.

![Connect GitHub Repository](images/image6.png)

Next, configure the backend settings such as:

- Project name
- Build command
- Start command

![Backend Configuration Settings](images/image7.png)

After configuring the project, proceed to the **Environment Variables** section. This part is important because this is where you will place your database credentials and other sensitive configuration values needed by the backend.

> **REFERENCE:**
> *These two `SMTP_USER` and `SMTP_PASS` are your Ethereal account credentials.*

![Environment Variables](images/image8.png)

Successfully deployed the backend.

![Backend Successfully Deployed](images/image9.png)

---

## Deploying the Frontend on Render

Before deploying the frontend, make sure to update the **Production API URL** so the frontend can communicate with the deployed backend server.

![Update Production API URL](images/image10.png)

In the Render dashboard, click the ***'NEW'*** dropdown button, and select ***'Static Site'***.

![Render - New Static Site](images/image11.png)

Next, reconnect or select the same GitHub repository that contains your frontend code.

![Select Frontend Repository](images/image12.png)

After selecting the repository, enter the name of your frontend website. In my case, I named it:

```
ipt-2026-frontend-barral
```

Then, configure the build settings and deploy the frontend.

![Frontend Deployed Successfully](images/image13.png)
