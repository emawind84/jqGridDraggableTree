/**
 *  jqGrid Tree Draggable plugin
 *  
 */
$.jgrid.extend({
	_draggableTr: function(domelem){
		var _this = this;
		var $t = this[0];
		var grid = $t;
		
		$(domelem).draggable({
			helper: function( event ) {
				var helper = $("<div class='ui-jqgrid'><table class='ui-jqgrid-btable'></table></div>");
				var tr = $(event.currentTarget).clone().removeAttr("id");
				tr.find(".tree-wrap").remove();
				helper.find("table").append( tr );
				console.log(helper[0]);
				return helper[0];
			},
			opacity: 0.7,
			appendTo: "body",
			cursorAt: { top: 0, left: -20 },
    		start: function(e, ui){
    		}
    	}).droppable({
    		drop: function(e, ui){
    			var parentId = $(e.target).attr("id");
    			var parentRecord = $(grid).jqGrid('getLocalRow', parentId );
    			var draggableRecord = $(grid).jqGrid('getLocalRow', ui.draggable.prop('id') );
    			
    			console.log("parentid " + parentId);
    			// test if is leaf or not
    			var treeReader = $(grid).jqGrid('getGridParam', 'treeReader');
    			var treedatatype = $(grid).jqGrid('getGridParam', 'treedatatype');
    			if(treedatatype != "local") { return; }
    			if(draggableRecord[treeReader.leaf_field] == false ) { return; }

    			$(grid).jqGrid('delTreeNode', ui.draggable.prop('id') );

    			if(parentRecord[treeReader.leaf_field] == true ) {
    				var ppNode = $(grid).jqGrid('getNodeParent', parentRecord);
    				console.log("is leaf  " + ppNode['_id_']);
    				$(grid).jqGrid('addChildNode', ui.draggable.prop('id'), ppNode['_id_'], draggableRecord );
    			} else {
    				console.log("is not leaf");
    				$(grid).jqGrid('addChildNode', ui.draggable.prop('id'), parentId, draggableRecord );
    			}
    			
    			_this._draggableTr( $( '#' + $.jgrid.jqID( ui.draggable.prop('id') )  ) );
    			
    			if( $t.p.onDroppedRow && $.isFunction( $t.p.onDroppedRow )) { 
    				$t.p.onDroppedRow.call($t, ui.draggable.prop('id'), e); 
    			}
    		}
    	});
	},
	
	draggableTree: function(){
		var _this = this;
		var $t = this[0];
		
		// TODO to fix
		$('tr', $t ).each(function(index){
			_this._draggableTr(this);
		});
		
		$(this).on('jqGridLoadComplete', function(){
			$('tr', $t ).each(function(index){
				_this._draggableTr(this);
			});
		});
	}
});