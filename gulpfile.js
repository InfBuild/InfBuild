const gulp = require("gulp");
const less = require("gulp-less");
const file = require("gulp-file");
const runSequence = require("run-sequence");
const ghPages = require("gulp-gh-pages");
const exec = require("child_process").exec;
const del = require("del");
const fs = require("fs");

function shellexec(cmd, cb)
{
	return exec(cmd, (err, stdout, stderr) =>
	{
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
}

gulp.task("install:bower", cb => shellexec("bower install", cb));
gulp.task("install", ["install:bower"]);

gulp.task("build:clean", cb =>
{
	del("dist").then(() => fs.mkdir("dist", cb));
});
gulp.task("build:less", () =>
	gulp.src("public/**/*.less")
		.pipe(less())
		.pipe(gulp.dest("dist")));
gulp.task("build:data", cb => shellexec("node tools/compile-data.js", cb));
gulp.task("build:bower", () =>
	gulp.src("bower_components/*/{dist,knockout-repeat.js}{,/**}", { base: "bower_components" })
		.pipe(gulp.dest("dist/components")));
gulp.task("build:public", () =>
	gulp.src([
		"public/**/*",
		"!public/**/*.less"
	], { base: "public" })
		.pipe(gulp.dest("dist")));
gulp.task("build:app", cb => shellexec("tsc -p app", cb));
gulp.task("build", cb =>
	runSequence(
		"build:clean",
		["build:less", "build:data", "build:public", "build:bower", "build:app"],
		cb));

gulp.task("deploy:ver", () =>
	file("ver.js", `Version.publishDate = new Date(${new Date().getTime()});`, { src: true })
		.pipe(gulp.dest("dist")));
gulp.task("deploy:gh-pages", () =>
	gulp.src("dist/**/*")
		.pipe(ghPages({ remoteUrl: "./" })));
gulp.task("deploy", cb =>
	runSequence(
		"build",
		"deploy:ver",
		"deploy:gh-pages",
		cb));