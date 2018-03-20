/**
 * Created by andrei.cornea on 10/6/2017.
 */


define('ds2-refresh-components',
    [
        'use!jquery',
        'use!slick',
        'componentInitializer'

    ],function($, slick, componentInitializer){



        function Reinit(callback){

            // reinits the js on makup reaload on after edit
            $('body').on('cq-edit-trigger-ds2' ,function(event,component){

                componentInitializer.initAll(component);
                callback(component);

            });

            // reinits the js on parent after makup reaload on the events of after/move,insert,copy
            $('body').on('cq-refreshParent-trigger-ds2' ,function(event,parent){

                componentInitializer.initAll(parent);
                callback(parent);

            });

        }


        return Reinit;

    });
