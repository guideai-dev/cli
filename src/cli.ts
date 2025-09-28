#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { Command } from 'commander'
import { loginFlow, logoutFlow, whoAmI } from './auth.js'

const program = new Command()

// Get package version
const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'))

program
  .name('guideai')
  .description('CLI for GuideAI')
  .version(packageJson.version)

// Authentication commands
program
  .command('login')
  .description('Authenticate with GuideAI server')
  .option('--server <url>', 'Server URL', 'http://localhost:3000')
  .action(async options => {
    try {
      await loginFlow(options.server)
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

program
  .command('logout')
  .description('Remove stored credentials')
  .action(async () => {
    try {
      await logoutFlow()
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

program
  .command('whoami')
  .description('Show current authenticated user')
  .action(async () => {
    try {
      await whoAmI()
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help()
}

// Parse command line arguments
program.parse()