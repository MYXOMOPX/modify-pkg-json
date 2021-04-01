import * as core from '@actions/core';
import {promises as fs} from "fs";

const getInputFilePath = (name: string, def: string|undefined): string => {
	const path = core.getInput('target', { required: def == undefined });
	if (!path) return def as string;
	return path;
}

const targetFilePath = getInputFilePath('target', undefined); //core.getInput('target', { required: true });
const saveToPath = getInputFilePath('save_to', targetFilePath);
const action = core.getInput('action', { required: true,  });
const actionArgs = core.getInput('argument', { required: false  });

let targetFile;
try {
	targetFile = require(targetFilePath);
	core.info("Package file opened");
} catch (e) {
	core.setFailed(`Can't open package file: ${targetFilePath}`);
}

const saveModifiedPackage = async (data: any) => {
	return fs.writeFile(saveToPath, JSON.stringify(data,null, 4))
}

const ACTION_MAP = {
	update_version: async (arg: string | number) => {
		targetFile.version = String(arg);
		saveModifiedPackage(targetFile);
		return arg;
	},
	update_dep: async (arg: string) => {
		const [depName, version] = arg.split(" ");
		targetFile.dependencies[depName] = version;
		saveModifiedPackage(targetFile);
		return version;
	},
	update_devdep: async (arg: string) => {
		const [depName, version] = arg.split(" ");
		targetFile.devDependencies[depName] = version;
		saveModifiedPackage(targetFile);
		return version;
	},
};

if (ACTION_MAP[action] == null) {
	core.setFailed(`Unknown action: ${action}`);
}

try {
	const res = ACTION_MAP[action](actionArgs)
	core.setOutput("result", res);
} catch (err) {
	core.setFailed(`Action failed with error ${err}`);
}