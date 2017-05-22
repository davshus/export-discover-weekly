const express = require('express');
const fs = require('fs');
const https = require('https');
const readline = require('readline');
const chalk = require('chalk')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const responsePort = 1234;

rl.question(chalk.green('Username: '), (answer) => {
  console.log("hey");
  rl.close();
});
