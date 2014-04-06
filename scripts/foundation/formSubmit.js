var formSubmit =
{
	/**
	  * Function bundles all input/select values from a passed scope into a key-value object 
	  * 
	  * @param formId - the ID for the form from which data will be gathered
	  * @return an object containing all user inputs
	  *
	  * @author kinsho
	  */
	collectData: function(formId)
	{
		var $form = $('#' + formId),
			$formInput = $form.find('input, select').not('[type=button]').not(':disabled'),
			dataStr = {};

		$formInput.each(function()
		{
			if (this.type === 'checkbox')
			{
				dataStr[this.name] = this.checked;
			}
			else
			{
				dataStr[this.name] = this.value;
			}
		});

		return dataStr;
	}
};