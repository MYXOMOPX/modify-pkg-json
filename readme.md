# modify-pkg-json

Using this github action you can easily modify npm's package.json: set/get common version or version of (dev) dependency 


# Usage
```
# set common version of package.json
- uses: MYXOMOPX/modify-pkg-json@master
  id: setcmnver
  with: 
    target: ./package.json
    action: "set_version"
    argument: "1.6.6"
     
# change version of react and save to dist package.json
- uses: MYXOMOPX/modify-pkg-json@master
  id: setdepver
  with: 
    target: ./package.json
    save_to: ./dist/package.json
    action: "set_dep_version"
    argument: "react ^17.0.2"   
    
# get version of webpack
- uses: MYXOMOPX/modify-pkg-json@master
  id: webpkver
  with: 
    target: ./package.json
    action: "get_devdep_version"
    argument: "webpack"     
          
```

# Inputs & Outputs

Existing inputs: 
* target - path to package.json (default is ./package.json)
* save_to - where to save modifed file (default - equals target)
* action - action you want to perform (required, see list below)
* argument - argument for action (see list of actions and arguments below)

Existing outputs:
* result - result of action (currenly it always common or dependency version)


# Actions
Existing:
* set_version - sets a common version of package.json
  * argument: a new version (string)
  * result: passed version
  
* get_version - sets a common version of package.json
  * result: current common version
  
* set_dep_version - sets a dependency version of package.json
  * argument: dependency name and version space-separated (eg. "react ^17.0.2")
  * result: new version of dependency   
  
* set_devdep_version - sets a dev-dependency version of package.json
  * argument: dev-dependency name and version space-separated (eg. "webpack ^5.30.0")
  * result: new version of dev-dependency 
    
* get_dep_version - gets a dependency version of package.json
  * argument: dependency name
  * result: a current version of dependency   
  
* get_devdep_version - gets a dev-dependency version of package.json
  * argument: dev-dependency name 
  * result: a current version of dev-dependency 
  
 # Caution
 * Currently this action only changes file and does not perform git commit/push
 * It changes an entire file, so you probably may have problems with merge