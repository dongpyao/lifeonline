<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7ea6e268-244c-41a4-8c0f-64b564608609

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

This project is configured for easy deployment on [Netlify](https://www.netlify.com/).

### Option 1: Manual Deployment (Using Netlify CLI)

1. Build the project:
   `npm run build`
2. Deploy the `dist` folder:
   `netlify deploy --dir=dist`

### Option 2: Continuous Deployment (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Connect your repository to Netlify.
3. Use the following settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Set up Environment Variables in Netlify UI:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `APP_URL`: Your Netlify site URL (optional, used for self-referential links).

The project already includes a `netlify.toml` file to automate these settings.

## Deploy to Zeabur (Recommended for China Access)

[Zeabur](https://zeabur.com/) is recommended for users in China as it provides better connectivity and performance.

### Deployment Steps:

1. Log in to [Zeabur](https://zeabur.com/).
2. Click **"Create Project"** and select **"Deploy Service"**.
3. Choose **"GitHub"** and authorize Zeabur to access your `lifeonline` repository.
4. Select the repository and Zeabur will automatically detect the Vite project.
5. In the service settings, go to **"Variables"** and add:
   - `GEMINI_API_KEY`: Your Gemini API key.
6. Zeabur will automatically build and deploy your project.
7. Once deployed, you can bind a free `*.zeabur.app` domain or your custom domain.
