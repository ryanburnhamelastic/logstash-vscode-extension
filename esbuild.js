const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy');
const process = require('process');

const watch = process.argv.includes('--watch');
const production = process.argv.includes('--production');

const buildOptions = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  outfile: './dist/extension.js',
  sourcemap: !production,
  minify: production,
  plugins: [
    copy({
      assets: [
        { from: ['./syntaxes/**/*'], to: ['./dist/syntaxes'] },
        { from: ['./language-configuration.json'], to: ['./dist'] },
        { from: ['./media/**/*'], to: ['./dist/media'] },
      ],
    }),
  ],
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('[watch] build started');
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('[watch] build finished');
  });
} 