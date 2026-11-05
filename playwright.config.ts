import { defineConfig } from '@playwright/test';
const baseURL=process.env.CYBERUI_BASE_URL??'http://127.0.0.1:4174';
export default defineConfig({testDir:'tests/e2e',fullyParallel:true,workers:2,timeout:45000,expect:{timeout:7000},reporter:[['list'],['html',{open:'never'}]],use:{baseURL,viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},webServer:process.env.CYBERUI_BASE_URL?undefined:{command:'pnpm --filter @cyberui/docs dev --port 4174 --strictPort',url:baseURL,reuseExistingServer:!process.env.CI,timeout:30000}});
