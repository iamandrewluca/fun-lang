const child_process = require("mz/child_process");
const { parse } = require("./parser");
const { check } = require("./checker");
const { generateCode } = require("./generator");

exports.run = async function run(code) {
    const result = {
        parse: null,
        check: null,
        generate: null
    };
    let ast;
    try {
        ast = parse(code);
        result.parse = { ast: ast };
        try {
            result.check = check(ast, code);
            if (result.check.length === 0) {
                try {
                    const js = generateCode(ast);
                    result.generate = { js: js };
                    try {
                        const [stdout, stderr] = await child_process.exec(`node -e '${js}'`);
                        result.exec = {
                            stdout: stdout.toString(),
                            stderr: stderr.toString()
                        };
                    } catch (e) {
                        result.exec = { error: e.stack };
                    }
                } catch (e) {
                    result.generate = { error: e.stack };
                }
            }
        } catch (e) {
            result.check = {
                error: e.stack
            };
        }
    } catch (e) {
        result.parse = { error: e.stack };
    }

    return result;
}
