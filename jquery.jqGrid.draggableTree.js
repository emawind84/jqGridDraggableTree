/**
 * jqGrid Customization
 */
(function ($) {
"use strict";

	if( !$.jgrid ) return;

	// custom functions added to $.fn.jqGrid
	$.jgrid.extend({

		draggableTree: function ( options ) {
			/************************************************************
			@desc Activate draggable functionality on a tree list

			IN:
				@param option - (true/false) will activate/deactivate the draggable feature.
			************************************************************/
			
			var enabled = true;
			if( typeof options === "boolean" ){
				enabled = options;
				options = {};
			}
			
			// the return is useful for method chaining
			return this.each(function () {
				var grid = this;
				var treedatatype = $(grid).jqGrid('getGridParam', 'treedatatype');
				if (treedatatype != "local") {
					console.warn("treedatatype have to be 'local'");
					return;
				}

				// TODO to fix
				_doDragAndDrop(grid, enabled, options);

				$(this).on('jqGridLoadComplete', function () {
					_doDragAndDrop(grid, enabled, options);
				});
			});
		},

	});

	function _draggableTr(grid, row, options ) {
		var options = $.extend( true, {
			drag: {
				disabled: false,
				addClasses: false, //  will prevent the ui-draggable class from being added. ( performance optimization )
				helper: function (event) {
					var helper = $("<div class='ui-draggable-helper'>Move 1 item</div>");
					/*var tr = $(event.currentTarget).clone().removeAttr("id");
					tr.find(".tree-wrap").remove();
					helper.find("table").append(tr);*/
					return helper[0];
				},
				opacity: 1,
				appendTo: "body",
				cursorAt: {
					top: 0,
					left: -20
				},
				start: function (e, ui) {}
			},
			drop: {
				disabled: false,
				addClasses: false, //  will prevent the ui-draggable class from being added. ( performance optimization )
				drop: function (e, ui) {
					var targetId = $(e.target).attr("id");
					var targetRecord = $(grid).jqGrid('getLocalRow', targetId);
					var draggableRecord = $(grid).jqGrid('getLocalRow', ui.draggable.prop('id'));
					var oriParent = $(grid).jqGrid('getNodeParent', draggableRecord );
					
					// test if is leaf or not
					/*var treeReader = $(grid).jqGrid('getGridParam', 'treeReader');
					if (draggableRecord[treeReader.leaf_field] == false) {
						return;
					}*/
					if( $(grid).jqGrid('getNodeChildren', draggableRecord ).length ){
						return;
					}
					
					// delete original row
					$(grid).jqGrid('delTreeNode', ui.draggable.prop('id'));

					// add dropped row
					$(grid).jqGrid('addChildNode', ui.draggable.prop('id'), targetId, draggableRecord);

					// event call
					if ( grid.p.onDroppedRow && $.isFunction(grid.p.onDroppedRow)) {
						if( grid.p.onDroppedRow.call(grid, ui.draggable.prop('id'), e) === false ) {
							// revert dropping
							$(grid).jqGrid('delTreeNode', ui.draggable.prop('id'));
							$(grid).jqGrid('addChildNode', ui.draggable.prop('id'), oriParent[grid.p.localReader.id], draggableRecord);
						}
					}
					
					// add draggable property to the new row
					_draggableTr( grid, $('#' + $.jgrid.jqID( ui.draggable.prop('id') ) ), options );
				}
			}
		}, options||{} );
		$(row).draggable( options.drag ).droppable( options.drop );	
	}

	function _doDragAndDrop(grid, enabled, options){
		$('tr', grid).each(function (index) {
			if( $(this).is(":data(ui-draggable)") && !enabled ) {
				$(this).draggable('destroy');
			} else if( !$(this).is(":data(ui-draggable)") && enabled && !$(this).hasClass('not-draggable-row') ) {
				_draggableTr(grid, this, options );
			}
		});
	}

})(jQuery);