<?php

namespace AdvertBundle\Controller;

use AdvertBundle\Entity\Advert;
use AdvertBundle\Form\AdvertType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\Tests\Extension\Core\Type\SubmitTypeTest;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class AdvertController extends Controller
{
    /**
     * @Route("/adverts", name="page.advert.list")
     * @Template()
     */
    public function listAction()
    {
        $em = $this->getDoctrine()->getManager();
        $er = $em->getRepository('AdvertBundle:Advert');
        $adverts = $er->findAllDescOrdered();

        return [
            'adverts' => $adverts,
        ];
    }

    /**
     * @Route("/create", name="page.advert.create")
     * @Template()
     */
    public function createAction(Request $request)
    {
        $form = $this->prepareCreateForm();

        if ($request->isMethod(Request::METHOD_POST)) {
            $form->handleRequest($request);

            $data = $form->getData();
        }

        return [
            'form' => $form->createView(),
        ];
    }

    /**
     * @param Request $request
     * @Route("/add", name="advert.add", options={"expose": true})
     * @Method("POST")
     * @return JsonResponse
     */
    public function addAction(Request $request) : JsonResponse
    {
        $json = [
            'status' => 'success',
        ];

        $form = $this->createForm(AdvertType::class);

        $form->handleRequest($request);

        if (!$form->isValid()) {
            $json['status'] = 'fail';
            $form->getErrors();
        }

        $advert = new Advert();
        $advert->setFromData($form->getData());

        $em = $this->getDoctrine()->getManager();
        $em->persist($advert);
        $em->flush();

        return new JsonResponse($json);
    }

    /**
     * @return Form
     */
    private function prepareCreateForm() : Form
    {
        $form = $this->createForm(AdvertType::class, [], [
            'action' => $this->generateUrl('advert.add'),
            'method' => Request::METHOD_POST,
        ]);

        return $form;
    }
}
