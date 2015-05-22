declare('CoreUtils', function() {
    include('Assert');

    // Get the global namespace and register the local namespace root
    var global = Function('return this')() || (42, eval)('this');

    function CoreUtils() {
        // ---------------------------------------------------------------------------
        // misc utility functions
        // ---------------------------------------------------------------------------
        this.rgba = function(r, g, b, a) {
              r = ~~r || 0;
              g = ~~g || 0;
              b = ~~b || 0;
              a = a || 1;
              return ["rgba(", r, ",", g,",", b, ",", a,")"].join("");
        };
        
        this.pad = function(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };
        
        this.getRandom = function(min, max) {
            return Math.random() * (max - min) + min;
        };
        
        this.getRandomInt = function(min, max) {
            return ~~(Math.random() * (max - min + 1)) + min;
        };

        this.getSigma = function(number) {
            return (number*(number+1))/2;
        }
        
        this.getGlobal = function() {
            return global;
        };
        
        this.isJsonString = function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            
            return true;
        };
        
        this.enumIsDefined = function(enumObject, value) {
            for(var key in enumObject) {
                if(enumObject[key] === value) {
                    return true;
                }
            }
            
            return false;
        };
        
        this.mergeObjects = function(objectA, objectB) {
            var result = {};
            if(objectA !== undefined) {
                for(var key in objectA) {
                    result[key] = objectA[key];
                };
            }
            
            if(objectB !== undefined) {
                for(var key in objectB) {
                    result[key] = objectB[key];
                };
            }
            
            return result;
        };
        
        this.getStackTrace = function() {
            return new Error().stack;
        };
        
        this.capitalizeString = function(value) {
        	return value.charAt(0).toUpperCase() + value.slice(1);
        };

        this.pickRandomProperty = function(obj) {
            var keys = Object.keys(obj)
            return obj[keys[ keys.length * Math.random() << 0]];
        }

        // ---------------------------------------------------------------------------
        // Html Utils
        // ---------------------------------------------------------------------------
        this.getImageUrl = function(imagePath) {
            return 'url("' + imagePath + '")';
        };

        this.setBackgroundImage = function(target, resource, repeat) {
            assert.isTrue(target.length > 0, "Target for background image was null!");

            if(repeat === undefined) {
                target.css({'background-image': this.getImageUrl(resource), 'background-size': '100% 100%', 'background-repeat': 'no-repeat'});
            } else {
                target.css({'background-image': this.getImageUrl(resource), 'background-repeat': repeat});
            }
        }
                
        // ---------------------------------------------------------------------------
        // Time / Date functions
        // ---------------------------------------------------------------------------        
        // Note: This has to use math.floor otherwise the value will be skewed for large time
        this.splitDateTime = function(seconds) {
            // returns array of [y, d, h, m, s, z]
            var result = [0, 0, 0, 0, 0, 0];
            var milliSeconds = Math.floor(seconds);
            
            result[0] = Math.floor(milliSeconds / (365 * 24 * 60 * 60 * 1000));
            
            milliSeconds %= (365 * 24 * 60 * 60 * 1000);
            result[1] = Math.floor(milliSeconds / (24 * 60 * 60 * 1000));
            
            milliSeconds %= (24 * 60 * 60 * 1000);
            result[2] = Math.floor(milliSeconds / (60 * 60 * 1000));
        
            milliSeconds %= (60 * 60 * 1000);
            result[3] = Math.floor(milliSeconds / (60 * 1000));
        
            milliSeconds %= (60 * 1000);
            result[4] = Math.floor(milliSeconds / 1000);
            result[5] = milliSeconds;
            
            return result;
        };
        
        this.getDurationDisplay = function(seconds) {
        	if (seconds === 0 || seconds === Number.POSITIVE_INFINITY) {
                return '~~';
            }
            
            var timeSplit = this.splitDateTime(seconds);
            years = timeSplit[0] > 0 ? timeSplit[0] + 'y ' : '';
            days = timeSplit[1] > 0 ? timeSplit[1] + 'd ' : '';
            time = this.getTimeDisplay(seconds);
            
            return years + days + time;
        };
        
        this.getTimeDisplay = function(seconds, use24hourTime) {
            if (seconds === 0 || seconds === Number.POSITIVE_INFINITY) {
                return '~~';
            }
            
            var timeSplit = this.splitDateTime(seconds);
            var suffix = '';
            if (use24hourTime === false) {
            	if (timeSplit[2] > 12) {
            		timeSplit[2] -= 12;
            		suffix = ' ' + StrLoc('pm');
            	} else {
            		suffix = ' ' + StrLoc('am');
            	}
            }
            
            var hourResult = this.pad(timeSplit[2], 2) + ':';
            var minuteResult = this.pad(timeSplit[3], 2) + ':';
            var secondResult = this.pad(timeSplit[4], 2);
            return hourResult + minuteResult + secondResult + suffix;
        };

        // Process a tick for a given stat and values, ticks for how many time passed and returns the tickTime back
        this.processInterval = function(gameTime, tickTime, delay, target, callback, value) {
            assert.isDefined(callback);

            if(tickTime === 0) {
                return gameTime.current;
            }

            var timeMissed = Math.floor(Math.abs(gameTime.current - (tickTime + delay)) / delay);
            if(timeMissed > 0) {
                for (var i = 0; i < timeMissed; i++) {
                    callback(target, value);
                }

                return gameTime.current;
            } else {
                return tickTime;
            }
        }
        
        // ---------------------------------------------------------------------------
        // Formatting
        // ---------------------------------------------------------------------------
        this.formatEveryThirdPower = function(notations) 
        {
          return function (value)
          {
            var base = 0;
            var notationValue = '';
            if (value >= 1000000 && Number.isFinite(value))
            {
              value /= 1000;
              while(Math.round(value) >= 1000) {
                value /= 1000;
                base++;
              }
              
              if (base > notations.length) {
                return StrLoc('Infinity');
              } else {
                notationValue = notations[base];
              }
            }
        
            return ( Math.round(value * 1000) / 1000.0 ).toLocaleString() + notationValue;
          };
        };
        
        this.formatScientificNotation = function(value)
        {
          if (value === 0 || !Number.isFinite(value) || (Math.abs(value) > 1 && Math.abs(value) < 100))
          {
            return this.formatRaw(value);
          }
          
          var sign = value > 0 ? '' : '-';
          value = Math.abs(value);
          var exp = ~~(Math.log(value)/Math.LN10);
          var num = Math.round((value/Math.pow(10, exp)) * 100) / 100;
          var output = num.toString();
          if (num === Math.round(num)) {
            output += '.00';
          } else if (num * 10 === Math.round(num * 10)) {
            output += '0';
          }
          
          return sign + output + '*10^' + exp;
        };
        
        this.formatRounded = function(value)
        {
          return (Math.round(value * 1000) / 1000).toString();
        };
        
        this.formatRaw = function(value) {
            if(value === undefined || value === null) {
                return "";
            }
            
            return value.toString();
        };
        
        this.formatters = {
                'raw': this.formatRaw,
                'rounded': this.formatRaw,
                'name': this.formatEveryThirdPower(['', StrLoc(' million'), StrLoc(' billion'), StrLoc(' trillion'), StrLoc(' quadrillion'),
                                                    StrLoc(' quintillion'), StrLoc(' sextillion'), StrLoc(' septillion'), StrLoc(' octillion'),
                                                    StrLoc(' nonillion'), StrLoc(' decillion')
                                                        ]),
                'shortName': this.formatEveryThirdPower(['', StrLoc(' M'), StrLoc(' B'), StrLoc(' T'), StrLoc(' Qa'), StrLoc(' Qi'), StrLoc(' Sx'),StrLoc(' Sp'), StrLoc(' Oc'), StrLoc(' No'), StrLoc(' De') ]),
                'shortName2': this.formatEveryThirdPower(['', StrLoc(' M'), StrLoc(' G'), StrLoc(' T'), StrLoc(' P'), StrLoc(' E'), StrLoc(' Z'), StrLoc(' Y')]),
                'scientific': this.formatScientificNotation
        };
    };
        
    return new CoreUtils();
});
