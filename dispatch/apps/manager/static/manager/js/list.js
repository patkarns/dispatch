var List=function(e){var t=[],i=function(e,t){var i=e.indexOf(t);i>-1&&e.splice(i,1)};$(".item-checkbox").change(function(){var e=$(this).parent().parent().data("id");this.checked?t.push(e):i(t,e),n()}),$(".delete-items").click(function(c){c.preventDefault(),dispatch.bulkRemove(e,t,function(e){$.each(e.deleted,function(e,n){i(t,n),$("#item-"+n).hide()}),n()})});var n=function(){$(".selected-items").html(t.length+" items selected")};n()},list=List($(".list").data("model"));