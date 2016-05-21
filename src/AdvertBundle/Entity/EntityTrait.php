<?php
/**
 * Created by PhpStorm.
 * User: hab
 * Date: 19.05.16
 * Time: 23:11
 */

namespace AdvertBundle\Entity;


use Doctrine\Common\Inflector\Inflector;

/**
 * Class EntityTrait
 * @package AdvertBundle\Entity
 */
trait EntityTrait
{
    /**
     * Удобное наполнение сущности
     * @param $data
     * @return $this
     */
    public function setFromData($data)
    {
        foreach ($data as $key => $value) {
            $property = Inflector::camelize($key);
            if (property_exists($this, $property)) {
                $this->$property = $value;
            }
        }

        return $this;
    }
}
