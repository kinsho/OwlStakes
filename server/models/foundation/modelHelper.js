define(['utility/exception'], function(exception)
{
// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Function responsible for formally defining any new property within a passed object. As part of the process
		 * of formally defining a property, a setter method will be instantiated to validate any new values that will
		 * be set into the property. The setter method will be constructed using select parameters.
		 *
		 * @param {Object} obj - the object that will carry the new property
		 * @param {String} propertyName - the name of the new property
		 * @param {Array[function]} validationFuncs - an array of functions that will be used to validate any new
		 * 		values to associate with the new property. All validation functions are expected to return booleans
		 * 		indicating whether the value passes its test
		 * @param {Array[String]} errorMessages - a collection of error messages, indexed in such a way so that the
		 * 		first error message pertains to the first validation function, the second message to the second
		 * 		validation function, etc
		 * @param {function} [getter] - a function that will direct the V8 engine on how to fetch any values
		 * 		associated with the new property
		 *
		 * @author kinsho
		 */
		defineProperty: function(obj, propertyName, validationFuncs, errorMessages, getter)
		{
			// If a getter is not defined, use generic function in its place instead
			getter = getter || function()
			{
				return this[propertyName];
			};

			Object.defineProperty(obj, propertyName,
			{
				configurable: false,
				enumerable: true,
				writable: true,

				get: getter,
				set: function(value)
				{
					var errorCounter = 0,
						i;

					// If an errors array has not been defined yet, initialize the property as an empty array
					if ( !(obj.errors) )
					{
						obj.errors = [];
					}

					// Validate the new value by passing it through all the validation functions. If it fails any
					// of the tests, take note of the failure and push the error message associated with that test
					// into the object's internal collection of error messages
					for (i = validationFuncs.length - 1; i >= 0; i--)
					{
						if ( !(validationFuncs(value)) )
						{
							errorCounter++;
							obj.errors.push(errorMessages[i]);
						}
					}

					// Only accept the new value if it passes all of its validation tests
					if ( !(errorCounter) )
					{
						this[propertyName] = value;
					}
				}
			});
		},

		/**
		 * Populates a data model using the property names registered to that model to pull values from the passed
		 * object
		 *
		 * @param {Object} object - the data model object to populate
		 * @param {Object} values - the object from which to pull values that can be used to populate the data
		 * 		model object
		 *
		 * @author kinsho
		 */
		initializeObject: function(object, values)
		{
			var field,
				i;

			// For each field registered in the data model, populate that field with its corresponding value from the
			// values object
			for (i = object.fields.length - 1; i >= 0; i--)
			{
				field = object.fields[i];
				object[field] = values[field] || null;
			}

			// If errors have been caught while trying to set values into the object, halt any further execution of
			// the server-side code, take those errors, and throw them back to the client for eventual display
			if ( (object.errors) && (object.errors.length) )
			{
				throw new exception.validationException(object.errors);
			}
		}
	};

// ----------------- END --------------------------
	return my;
});