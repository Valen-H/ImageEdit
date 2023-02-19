"use strict";

const	press	= {
	nored:		"//Remove Red Color\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\ti.data[j]\t= 0;\n}\n\ndata.push(i);",
	nogreen:	"//Remove Green Color\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\ti.data[j + 1]\t= 0;\n}\n\ndata.push(i);",
	noblue:		"//Remove Blue Color\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\ti.data[j + 2]\t= 0;\n}\n\ndata.push(i);",
	gray:		"//Apply % Grayscale\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\t[ i.data[j], i.data[j + 1], i.data[j + 2] ]\t= gray(i.data[j], i.data[j + 1], i.data[j + 2], 1);\t//Change '1' to adjust percent\n}\n\ndata.push(i);",
	invert:		"//Apply % Inversion\n\nconst\tinversion\t= 1;\t//1=100%\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\t[ i.data[j], i.data[j + 1], i.data[j + 2] ] = [ i.data[j], i.data[j + 1], i.data[j + 2] ].map(c => invert(c, inversion));\n}\n\ndata.push(i);",
	bright:		"//Apply % Brightness\n\nconst\tbrightness\t= .5;\t//1=100%\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\t[ i.data[j], i.data[j + 1], i.data[j + 2] ] = [ i.data[j], i.data[j + 1], i.data[j + 2] ].map(c => bright(c, brightness));\n}\n\ndata.push(i);",
	trans:		"//Apply % Transparency\n\nconst\tcutoff\t= 5;\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\tif ((is_bound(i.data[j], 0, cutoff) && is_bound(i.data[j + 1], 0, cutoff) && is_bound(i.data[j + 2], 0, cutoff)) || (is_bound(i.data[j], 0xff - cutoff, 0xff) && is_bound(i.data[j + 1], 0xff - cutoff, 0xff) && is_bound(i.data[j + 2], 0xff - cutoff, 0xff)))\n\ti.data[j + 3]\t= 0;\n}\n\ndata.push(i);",
	hue:		"//Apply % Hue\n\nconst\thue\t= [ 1, 1, 1, .5 ];\n\nfor (let j = 0; j < i.data.length; j += 4) {\n\ti.data[j]\t*= hue[0];\n\ti.data[j + 1]\t*= hue[1];\n\ti.data[j + 2]\t*= hue[2];\n\ti.data[j + 3]\t*= hue[3];\n}\n\ndata.push(i);",
	custom:		"",
};
let	canv, file, code, presets,
	ctx, img, data	= [ ];

function gray(r, g, b, p = 1) {
	const	gr	= (r + g + b) / 3;
	
	return [ r, g, b ].map(c => c * (1 - p) + gr * p);
} //gray
function invert(c, p = 1) {
	return c * (1 - p) + (0xff - c) * p;
} //invert
function bright(c, p = 1) {
	return Math.min(Math.abs(c * p), 0xff);
} //bright
function is_bound(n, m, M) {
	return n >= m && n <= M;
} //is_bound
function bound(n, m, M) {
	return n < m ? m : (n > M ? M : n);
} //bound

window.onload	= function load(e) {
	console.info("Loaded.");
	
	canv	= document.getElementById("canv");
	file	= document.getElementById("file");
	code	= document.getElementById("code");
	presets	= document.getElementById("presets");
	ctx		= canv.getContext("2d");
	
	code.onchange		= function change(e) {
		press.custom	= e.target.value;
	}; //change
	presets.onchange	= function change(e) {
		code.value		= press[e.target.value];
	}; //change
	file.onchange		= async function change(e) {
		img		= await readFile();
		
		data	= [ ];
		
		render();
	}; //change
	
	canv.onclick		= e => save();
	canv.ondragenter	= e => {
		e.preventDefault();
		e.stopImmediatePropagation();
	};
	canv.ondragover		= e => {
		e.preventDefault();
		e.stopImmediatePropagation();
	};
	canv.ondrop			= async e => {
		e.stopPropagation();
		e.preventDefault();
		
		file.files	= e.dataTransfer.files;
		img			= await readFile();
		
		render();
	};
}; //load

async function readFile(from = file, idx = 0) {
	if (!from.files)	return;
	
	return new Promise((res, rej) => {
		const	reader	= new FileReader();
		
		reader.onload	= e => {
			const	img	= document.createElement("img");
			
			img.decoding		= "sync";
			img.elementtiming	= "img";
			img.fetchpriority	= "high";
			img.loading			= "eager";
			img.alt				= from.files[idx].name;
			img.src				= e.target.result;
			img.type			= from.files[idx].type;
			
			res(img);
		}
		reader.readAsDataURL(from.files[idx]);
	});
} //readFile

function undo() {
	data.pop();
	
	render(true);
} //undo

function render(no = false) {
	canv.width	= img.naturalWidth;
	canv.height	= img.naturalHeight;
	
	ctx.clearRect(0, 0, canv.width, canv.height);
	
	if (!data.length)
		ctx.drawImage(img, 0, 0);
	else
		ctx.putImageData(data[data.length - 1], 0, 0);
	
	if (!no || !data.length) {
		data.push(ctx.getImageData(0, 0, canv.width, canv.height, {
			colorSpace:	"srgb",
		}));
	}
} //render

function process(i = new ImageData(new Uint8ClampedArray(data[data.length - 1].data), data[data.length - 1].width, data[data.length - 1].height, { colorSpace: "srgb" }), c = code.value) {
	eval(c);
	
	render(true);
} //process

function save() {
	const	a	= document.createElement('a');
	
	a.href		= canv.toDataURL(img.type, 1);
	a.download	= img.alt;
	a.click();
	
	return a;
} //save
