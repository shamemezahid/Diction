
const databaseURL = "https://raw.githubusercontent.com/shamemezahid/Diction/main/dataset/E2Bdatabase.json";
const base = 256;
const prime = 999999999989; 

class Dictionary{
	size
	words
}

class PerfectHash{
    aOne=null;
	bOne=null ;
	hashTable;
	secondaryKeys;

	initialization(){
		this.hashTable = new Array(dictionary.size);
		this.secondaryKeys = new Array(dictionary.size);
		for(var i=0; i<dictionary.size; i++){
			this.hashTable[i]=[];
			this.secondaryKeys[i]=null;
		}
	}

	toNumber(string){
		var stringKey = 0;
		for(var i=0; i<string.length; i++){
			stringKey = ((stringKey*base)%prime+string.charCodeAt(i))%prime;
		}
		return stringKey;
	}

	hashKeyOne(string){
		var a,b;
		a = 1+ Math.floor(Math.random()*(prime-1));
		b = Math.floor(Math.random()*prime);
		var stringKey = this.toNumber(string);

		if(this.aOne == null || this.bOne == null){
			this.aOne=a;
			this.bOne=b;
		}
		else{
			a=this.aOne;
			b=this.bOne;
		}
		var keyOne = (a*stringKey+b)%prime;
		return keyOne;
	}

	hashFunctionOne(string){
		return this.hashKeyOne(string)%dictionary.size;
	}

	hashKeyTwo(a, b, m, string){
		var keyOne = this.hashKeyOne(string);
		var secondKey = (a*keyOne+b)%prime;
		return secondKey;

	}

	hashFunctionTwo(a, b, m, string){
		return this.hashKeyTwo(a,b,m,string)%m;	                                                
	}

	collision(a, b, m, firstTable, secondTable){
		for(var i=0; i<firstTable.length; i++){
			var secondaryHash = this.hashFunctionTwo(a,b,m,dictionary.words[firstTable[i]].en);

			if(secondTable[secondaryHash] == null){
				secondTable[secondaryHash] = firstTable[i];
			}
			else{
				return true
			}
		}
		return false;

	}

	hashTableTwo(mainTable, primaryHash){
        var m = mainTable.length*mainTable.length;
		var secondTable = new Array(m); 
		for(var i=0; i<m; i++){
			secondTable[i]=null;
		}
		var firstTable = Array.from(mainTable);
		var a,b;
		a = 1+ Math.floor(Math.random()*(prime-1));
		b = Math.floor(Math.random()*prime);
        while(this.collision(a,b,m,firstTable,secondTable)){
			a = 1+ Math.floor(Math.random()*(prime-1));
			b = Math.floor(Math.random()*prime);
			secondTable.fill(null);
		}
		this.secondaryKeys[primaryHash] = [a,b,m];
		return secondTable;

	}

    isUnique(string, checkTable){
		var checkTableLength = checkTable.length;
		for(var i=0; i<checkTableLength; i++){
			if(dictionary.words[checkTable[i]].en == string){
				return false;
			}
		}
		return true;
	}

	generateHashTable(){
		this.initialization();
		for(var i=0; i<dictionary.size; i++){
			dictionary.words[i].en = dictionary.words[i].en.toLowerCase();
			var string = dictionary.words[i].en;
			var primaryHash = this.hashFunctionOne(string);
			if(this.isUnique(string,this.hashTable[primaryHash])){
				this.hashTable[primaryHash].push(i);
			} 
		}
		for(var i=0; i<dictionary.size; i++){
            if(this.hashTable[i].length > 1){
				this.hashTable[i] = this.hashTableTwo(this.hashTable[i],i); 
			}
            else if(this.hashTable[i].length == 1){
				this.secondaryKeys[i] = [1,0,1];
			}
		}
		console.log("Hashing Completed");
	}

}

var hash = new PerfectHash();
var dictionary = new Dictionary();

window.onload = function run(){
	dictionary = fetch(databaseURL)
	.then(response =>{
		if(!response.ok){
			throw new Error(response.status);
		}return response.json()
	}).then(json => {
		dictionary.words = json;
		dictionary.size = Object.keys(dictionary.words).length;
	}).then(response =>{
		hash.generateHashTable();
		console.log("Load Successful");
	})
}


function search(){
    var queryText = document.getElementById("text-input-box");
	var englishWord = queryText.value.toLowerCase();
    var resultText = document.getElementById("output-text");
	var primaryHash = hash.hashFunctionOne(englishWord);
	var ohno = document.getElementById("ohno-image");
	ohno.style.visibility="hidden";

	if(queryText.length==0){
		console.log("box khali");
		ohno.style.visibility="hidden";
	}
	
	try{
		if(hash.secondaryKeys[primaryHash] == null){
			ohno.style.visibility="visible";
			throw 'no secondary key';
		}
		var a = hash.secondaryKeys[primaryHash][0];
		var b = hash.secondaryKeys[primaryHash][1];
		var m = hash.secondaryKeys[primaryHash][2];
		var secondaryHash = hash.hashFunctionTwo(a, b, m, englishWord);

		if(hash.hashTable[primaryHash][secondaryHash]!=null 
			&& dictionary.words[hash.hashTable[primaryHash][secondaryHash]].en == englishWord){
			resultText.innerHTML = dictionary.words[hash.hashTable[primaryHash][secondaryHash]].bn;
			ohno.style.visibility="hidden";
		}
		else{
			ohno.style.visibility="visible";
			throw 'Word not found';
			
		}
	}catch(err){
		console.log(err);
		resultText.innerHTML = "";
		ohno.style.visibility="visible";		
	}	
	
}