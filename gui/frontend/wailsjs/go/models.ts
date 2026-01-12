export namespace main {
	
	export class ScanOptions {
	    source: string;
	    sourceType: string;
	    states: string[];
	    format: string;
	    outputDir: string;
	    minSeverity: string;
	    failOnViolation: boolean;
	    token: string;
	
	    static createFrom(source: any = {}) {
	        return new ScanOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.source = source["source"];
	        this.sourceType = source["sourceType"];
	        this.states = source["states"];
	        this.format = source["format"];
	        this.outputDir = source["outputDir"];
	        this.minSeverity = source["minSeverity"];
	        this.failOnViolation = source["failOnViolation"];
	        this.token = source["token"];
	    }
	}

}

