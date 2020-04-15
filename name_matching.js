(function(){
  function levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }

    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return distanceMatrix[b.length][a.length];
  }

  const transDict = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': 'e',
    'ж': 'j',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'kh',
    'ц': 'ts',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'shch',
    'ъ': '',
    'ь': '',
    'ы': 'y',
    'э': 'e',
    'ю': 'yu',
    'я': 'ya',
    ' ': '.',
   };

  function rusToLatin(str) {
    return str.toLowerCase().split('').map(sym => transDict[sym] || sym).join('');
  }

  let names = [];
  function loadDict(nameList) {
    names = nameList.filter(e => !!e);
  }

  function swapName(name) {
    const [p1, p2] = name.split(/[\._\W]/);
    return [p2, p1].join('.');
  }

  function findName(searchName) {
    if (!searchName) {
      return;
    }
    const searchNameLatin = rusToLatin(searchName);
    const distances = names.map(name => {
      let val = levenshteinDistance(name, searchNameLatin);
      let val2 = levenshteinDistance(name, swapName(searchNameLatin));
      return {
        name,
        val: Math.min(val, val2),
      }
    });

    distances.sort((a,b) => a.val - b.val)

    if (!distances.length) {
      return;
    }
    const target = distances[0];
    console.log(searchName, target.name, target.val);
    if (target.val >= 7) {
      return;
    }
    return target.name;
  }

  window.textUtils = {
    loadDict,
    findName,
  };
})();
