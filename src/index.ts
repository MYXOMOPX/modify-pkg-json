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



const saveModifiedPackage = async (data: any) => {
	return fs.writeFile(saveToPath, JSON.stringify(data,null, 4))
}


const ACTION_MAP = {
	update_version: async (json: any, arg: string | number) => {
		json.version = String(arg);
		saveModifiedPackage(json);
		return arg;
	},
	update_dep: async (json: any, arg: string) => {
		const [depName, version] = arg.split(" ");
		json.dependencies[depName] = version;
		saveModifiedPackage(json);
		return version;
	},
	update_devdep: async (json: any, arg: string) => {
		const [depName, version] = arg.split(" ");
		json.devDependencies[depName] = version;
		saveModifiedPackage(json);
		return version;
	},
};

const run = async () => {
	let targetJSON;

	try {
		core.info(`Trying to open ${targetFilePath}`)
		targetJSON = JSON.parse(await fs.readFile(targetFilePath, {encoding: "utf8"}))
		core.info("Package file opened");
	} catch (e) {
		core.setFailed(`Can't open and/or parse package file: ${targetFilePath}`);
		return;
	}

	if (ACTION_MAP[action] == null) {
		core.setFailed(`Unknown action: ${action}`);
	}

	try {
		const res = ACTION_MAP[action](targetJSON, actionArgs)
		core.setOutput("result", res);
	} catch (err) {
		core.setFailed(`Action failed with error ${err}`);
	}
}

run();