<?php

/**
  * Class that will form the base for every single model class
  *
  * @author kinsho
  */
class AbstractBase
{

	// -------- CLASS MEMBERS -------------
	
	// --------- CONSTRUCTOR --------------
/**
  * Generic constructor that can be invoked to populate members of whatever model class calls upon it.
  *
  * @param $data - an array containing all the data with which to instantiate the new object.
  * @return - the new object
  * 
  * @author kinsho
  */
	public function __construct (array $data = null)
	{
        $methods = get_class_methods($this);
        foreach ($data as $key => $value)
		{
            $method = 'set' . ucfirst($key);
            if (in_array($method, $methods))
			{
                $this->$method($value);
            }
        }
        return $this;		
	}
	
	// ------- ACCESSOR FUNCTIONS ---------
	
	// ------- ASSIST FUNCTIONS -----------
	
	
}



?>