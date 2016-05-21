<?php

namespace AdvertBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\GreaterThan;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class AdvertType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', TextType::class, [
            'label' => 'Заголовок',
            'constraints' => [
                new NotBlank(),
                new Length(['min' => 10, 'max' => '255'])
            ]
        ]);

        $builder->add('description', TextareaType::class, [
            'label' => 'Описание',
            'constraints' => [
                new NotBlank(),
                new Length(['max' => 4000]),
            ],
        ]);

        $builder->add('price', MoneyType::class, [
            'label' => 'Цена',
            'constraints' => [
                new NotBlank(),
                new GreaterThan(0),
            ]
        ]);

        $currencies = [
            'UAH' => 'UAH',
            'USD' => 'USD',
            'EUR' => 'EUR',
        ];

        $builder->add('currency', ChoiceType::class, [
            'label' => 'Валюта',
            'choices' => $currencies,
            'constraints' => [
                new NotBlank(),
            ]
        ]);

        $builder->add('preview', SubmitType::class, [
            'label' => 'Предпросмотр',
        ]);

        $builder->add('submit', SubmitType::class, [
            'label' => 'Сохранить',
        ]);
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
//        $resolver->setDefaults([
//            'data_class' => 'AdvertBundle\Entity\Advert'
//        ]);
    }
}
