import chalk from 'chalk';

class Log {
    red(str: string) {
        console.log(chalk.red(str));
    }

    blue(str: string) {
        console.log(chalk.blue(str));
    }

    yellow(str: string) {
        console.log(chalk.yellow(str));
    }

    green(str: string) {
        console.log(chalk.green(str));
    }
}

export const log = new Log();
