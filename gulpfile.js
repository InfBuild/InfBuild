const
	gulp = require("gulp"),
	less = require("gulp-less"),
	file = require("gulp-file"),
	browserify = require("browserify"),
	tsify = require("tsify"),
	runSequence = require("run-sequence"),
	exec = require("child_process").exec,
	del = require("del"),
	fs = require("fs"),
	source = require("vinyl-source-stream");

function shellexec(cmd, cb)
{
	return exec(cmd, (err, stdout, stderr) =>
	{
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
}

gulp.task("build:clean", cb =>
{
	del("dist").then(() => fs.mkdir("dist", cb));
});
gulp.task("build:less", () =>
	gulp.src("public/**/*.less")
		.pipe(less())
		.pipe(gulp.dest("dist")));
gulp.task("build:data", cb => shellexec("node tools/compile-data.js", cb));
gulp.task("build:public", () =>
	gulp.src([
		"public/**/*",
		"!public/**/*.less"
	], { base: "public" })
		.pipe(gulp.dest("dist")));
gulp.task("build:app", () =>
	browserify({ entries: "app/entrypoint.tsx", debug: true })
		.plugin(tsify)
		.bundle()
		.pipe(source("app.js"))
		.pipe(gulp.dest("dist")));
gulp.task("build", cb =>
	runSequence(
		"build:clean",
		["build:less", "build:data", "build:public", "build:app"],
		cb));

gulp.task("deploy:ver", () =>
	file("ver.js", `function initializeVersion(Version) { return new Version(new Date(${new Date().getTime()})); }`, { src: true })
		.pipe(gulp.dest("dist")));
gulp.task("deploy", cb =>
	runSequence(
		"build",
		"deploy:ver",
		cb));