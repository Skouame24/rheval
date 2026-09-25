module.exports = {
  apps: [
    {
      name: "rheval-front",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXTAUTH_URL: "http://10.5.6.7:3000",
        NEXTAUTH_SECRET: "agilly_rheval_secret_key_entra_id_2026_sso",
        AZURE_AD_CLIENT_ID: "f351e4f4-6b70-462e-9c80-eea701265f0d",
        AZURE_AD_TENANT_ID: "4a824101-74e2-4eca-8f3a-dac68503d06f",
        NEXT_PUBLIC_API_URL: "http://10.5.6.8:3001/api",
      },
    },
  ],
};
