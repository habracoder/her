<?php

namespace AppBundle\Controller;

use AdvertBundle\Entity\Category;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class MainController extends Controller
{
    /**
     * @Route("/", name="page.main")
     * @Template()
     */
    public function indexAction()
    {
        $category = new Category();

        $em = $this->getDoctrine()->getManager();
        $er = $em->getRepository(Category::class);
        $main = $er->find(1);

        $category->setTitle('Аренда квартир');
        $category->setParent($main);

        $em->persist($category);

        return [

        ];
    }
}
