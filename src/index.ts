import * as core from '@actions/core';
import {promises as fs} from "fs";
import path from "path";


const workspaceDir = process.env.GITHUB_WORKSPACE || "./";

const getInputFilePath = (name: string, def: string|undefined): string => {
	const p = core.getInput('target', { required: def == undefined });
	if (!p) return def as string;
	return path.join(workspaceDir, p);
}

const targetFilePath = getInputFilePath('target', undefined); //core.getInput('target', { required: true });
const saveToPath = getInputFilePath('save_to', targetFilePath);
const action = core.getInput('action', { required: true,  });
const actionArgs = core.getInput('argument', { required: false  });




const saveModifiedPackage = async (data: any) => {
	return fs.writeFile(saveToPath, JSON.stringify(data,null, 4))
}


const ACTION_MAP = {
	set_version: async (json: any, arg: string | number) => {
		json.version = String(arg);
		saveModifiedPackage(json);
		return arg;
	},
	set_dep_version: async (json: any, arg: string) => {
		const [depName, version] = arg.split(" ");
		json.dependencies = json.dependencies || {}
		json.dependencies[depName] = version;
		saveModifiedPackage(json);
		return version;
	},
	set_devdep_version: async (json: any, arg: string) => {
		const [depName, version] = arg.split(" ");
		json.devDependencies = json.devDependencies || {}
		json.devDependencies[depName] = version;
		saveModifiedPackage(json);
		return version;
	},
	get_dep_version: async (json: any, arg: string) => {
		return json.dependencies ? json.dependencies[arg] : null;
	},
	get_devdep_version: async (json: any, arg: string) => {
		return json.devDependencies ? json.devDependencies[arg] : null;
	},
	get_version: async (json: any, arg: string) => {
		return json.version
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