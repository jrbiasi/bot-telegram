module.exports = {
	presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
	sourceMaps: true,
	plugins: [
		// ✅ CRÍTICO: module-resolver DEVE VIR PRIMEIRO para resolver imports corretamente
		[
			'module-resolver',
			{
				alias: {
					'@dtos': './src/dtos',
				},
			},
		],
		// ✅ Decorators DEVEM estar ANTES de class-properties
		['@babel/plugin-proposal-decorators', { legacy: true }],
		// Transform class properties usando assignment direto (loose mode)
		['@babel/plugin-proposal-class-properties', { loose: true }],
		'@babel/plugin-syntax-import-assertions',
	],
};
