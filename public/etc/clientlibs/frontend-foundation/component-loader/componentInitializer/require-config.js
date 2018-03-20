requirejs.config({
					 use: {
					     jquery: {
                                     exports: 'jQuery'
                                 },
						 jqueryLazy: {
							 deps: ['use!jquery'],
							exports: 'jQuery'
						 }
					 }
				});