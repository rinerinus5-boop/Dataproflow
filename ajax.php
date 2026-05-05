<?php global $post;
	$choose_fabric_grades = get_field('choose_fabric_grades_copy', $post->ID);
	$has_fabric_grade_limit = false;
	$grade_list = [];
	
if(get_field('pathback') !== 'q' || get_field('pathseat') !== 'q'){
	$colors = get_terms("pa_color");
	$patterns = get_terms("pa_pattern");
	$grades = get_terms("pa_grade");
	$suppliers = get_terms("pa_supplier");
	$materials = get_terms("pa_fabric-type");
	if (!empty($choose_fabric_grades)) {
		$grades = $choose_fabric_grades;
		$has_fabric_grade_limit = true;
		foreach ($choose_fabric_grades as $gr) {
			$grade_list[] = $gr->name;
		}
		$grade_list = implode(",", $grade_list);
	}
	?>
	<div class="custom-fabric-filter test-template" style="display:none">
		<div class="name-filter sub-filter" data-type="name">
		<h4 style="display:none;">Search</h4>
		<input id="name-search" type="text" placeholder="Search">
			<i class="fas fa-search"></i>
		</div>
		<div class="material-filter sub-filter" data-type="material">
		<h4 style="display:none;">Material</h4>
		<select>
			<option value="any">Material - Any</option>
			<?php foreach ( $materials as $term ) {
				echo "<option value=".$term->name.">" . ucfirst($term->name) . "</option>";
			}?>
		</select>
		</div>
		<div class="color-filter sub-filter" data-type="color">
		<h4 style="display:none;">Color</h4>
		<select>
			<!--<select>-->
		<option value="any">Color - Any</option>
			<?php foreach ( $colors as $term ) {
				echo "<option value=".$term->name.">" . ucfirst($term->name) . "</option>";
			}?>
		</select>
		</div>
		<div class="grade-filter sub-filter" data-type="grade">
		<h4 style="display:none;">Grade</h4>
		<select <?php if ($has_fabric_grade_limit  == true) { echo 'class="has-limit-grade" data-gradelist="'.$grade_list.'"';}?>>
			<option value="any">Grade - Any</option>
			<?php foreach ( $grades as $term ) {
				echo "<option value=".str_replace(" ","-",$term->name).">" . ucfirst($term->name) . "</option>";
			}?>
		</select>
		</div>
		<div class="pattern-filter sub-filter" data-type="pattern">
		<h4 style="display:none;">Pattern</h4>
		<select>
			<option value="any">Pattern - Any</option>
			<?php foreach ( $patterns as $term ) {
				echo "<option value=".$term->name.">" . ucfirst($term->name) . "</option>";
			}?>
		</select>
		</div>
		<div class="supplier-filter sub-filter" data-type="supplier">
		<h4 style="display:none;">Supplier</h4>
		<select>
			<option value="any">Supplier - Any</option>
			<?php foreach ( $suppliers as $term ) {
				echo "<option value=".$term->name.">" . ucfirst($term->name) . "</option>";
			}?>
		</select>
		</div>
		
	</div>
<style>
	.sub-filter {
		width: 200px;
		display: inline-block;
		margin: 5px 0 0 0;
		vertical-align: top;
	}
	.sub-filter select{
		height: 37px;
		width: 100%;
		font-size: 13px;
	}
	.sub-filter input {
		width: 100%;
	}
	.sub-filter .table-search-results {
		border: 1px solid #ccc;
		width: 200px;
	}
	.sub-filter.name-filter{
		position: relative;
		height: 20px;
	}
	.div-search-result {
		height: 300px;
		overflow: scroll;
		display:none;
		position: absolute;
		z-index: 99;
		background: #fff;
	}
	.sub-filter .table-search-results td{
		padding: 4px;
	}
	.select2-container {
    width: 100% !important;
	}
	input#name-search {
		height: 39px;
	}
	i.fas.fa-search {
	position:relative;
  	left:174px;
  	top:-31px;
  	z-index:999;
	}
	@media only screen and (max-width: 1290px) {
	.sub-filter.name-filter {
    height: 40px;
}
	}
	.swatch-wrapper .hoverImg {
  position: absolute;
  left: 50px;
  top: 50px;
  display: none;
  	z-index: 99999;
	background-color: white;
    padding: 2px;
    border: grey solid 1px;
	width: 300px;
    text-overflow: ellipsis;
    max-width: 350px;
}

.swatch-wrapper:hover .hoverImg {
  display: block;
}
</style>
<script>
	jQuery(document).ready(function(){
		jQuery('.sub-filter select').select2();
// 		jQuery('.sub-filter select').change(function(){
			
// 			jQuery('#picker_pa_seat-fabric .select-option.swatch-wrapper').hide();
// 			jQuery('#picker_pa_back-fabric .select-option.swatch-wrapper').hide();
// 				var color = jQuery('.color-filter select').val();			
// 				var grade = jQuery('.grade-filter select').val();
// 				var pattern = jQuery('.pattern-filter select').val();
// 				var supplier = jQuery('.supplier-filter select').val();
// 				var material = jQuery('.material-filter select').val();		
// 				var name = jQuery('.sub-filter input#name-search').val().toLowerCase();
			
// 				filter_fabric(name,color,grade,pattern,supplier,material);
			
				
				
// 		});	
// 		jQuery('.sub-filter input#name-search').keyup(function(e){
// 			e.preventDefault();
// 			var name = jQuery(this).val().toLowerCase();
// 				jQuery('#picker_pa_seat-fabric .select-option.swatch-wrapper').hide();
// 			jQuery('#picker_pa_back-fabric .select-option.swatch-wrapper').hide();
// 				var color = jQuery('.color-filter select').val();			
// 				var grade = jQuery('.grade-filter select').val();
// 				var pattern = jQuery('.pattern-filter select').val();
// 				var supplier = jQuery('.supplier-filter select').val();
// 				var material = jQuery('.material-filter select').val();	
			
// 				filter_fabric(name,color,grade,pattern,supplier,material);	
			
// 		});
		
// 		function filter_fabric(name,color,grade,pattern,supplier,material){
// 			if(name==''){
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
				
// 			}else{
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();				
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 			}
// 			var count_back_option_showed = jQuery('#picker_pa_back-fabric .select-option.swatch-wrapper:not([style*="display: none"])').length;
// 				if(count_back_option_showed == 0 && jQuery('#picker_pa_back-fabric').find('.matching-message').length == 0){
// 					jQuery('#picker_pa_back-fabric').append('<p class="matching-message">No Matching Fabrics</p>');
// 				}else if(count_back_option_showed != 0){
// 					jQuery('#picker_pa_back-fabric .matching-message').remove();
// 				}
// 				var count_seat_option_showed = jQuery('#picker_pa_seat-fabric .select-option.swatch-wrapper:not([style*="display: none"])').length;
// 				if(count_seat_option_showed == 0 && jQuery('#picker_pa_seat-fabric').find('.matching-message').length == 0){
// 					jQuery('#picker_pa_seat-fabric').append('<p class="matching-message">No Matching Fabrics</p>');
// 				}else if(count_seat_option_showed != 0){
// 					jQuery('#picker_pa_seat-fabric .matching-message').remove();
// 				}
// 		}
		
 	});
</script>
<?php } ?>
<form class="variations_form cart" action="https://woocommerce-403275-1499272.cloudwaysapps.com/product/louise-barstool-ds" method="post" enctype="multipart/form-data" data-product_id="12589" >
	
			<table class="variations" cellspacing="0">
			<tbody>
			
			<?php if ( (get_field('pathback')) !== 'q' ) { ?>
			
									<tr class="row var-swatch alt">
						<td class="label col-sm-12"><label style="margin:10px auto"for="pa_back-fabric">Back Fabric<span class="load-fabric" style="display:none" data-type="back" data-divid="picker_pa_back-fabric">Show list					
							</span><span class="loading-message" style="display:none"> <i class="fa fa-spinner fa-spin loading-message"></i> Loading...</span></label></td>
						<td class="value col-sm-12">
							<div id="picker_pa_back-fabric" style="display:none" class="select swatch-control" data-type="back"></div>
	</td></tr>
			<?php } ?>
					
					<?php if ( (get_field('pathseat')) !== 'q' ) { ?>
									<tr class="row var-swatch">
						<td class="label col-sm-12"><label style="margin:10px auto" for="pa_seat-fabric">Seat Fabric <span class="load-fabric" style="display:none" data-type="seat" data-divid="picker_pa_seat-fabric">Show list					
							</span><span class="loading-message" style="display:none"> <i class="fa fa-spinner fa-spin loading-message"></i> Loading...</span></label></td>
						<td class="value col-sm-12">
							<div id="picker_pa_seat-fabric" style="display:none" class="select swatch-control" data-type="seat">
							
							</div><!--<div class="attribute_pa_seat-fabric_picker_label swatch-label">&nbsp;</div>	-->					</td>
					</tr>
							
							
								
					<?php } ?>
					
						<?php if ( (get_field('has_wood_frames_ds')) ) { 
						?>
							<tr class="row var-swatch alt">
						<td class="label col-sm-12"><label style="margin:10px auto" for="pa_frame-finish">Frame Finish <span class="load-fabric" style="display:none" data-type="woodframe" data-divid="picker_pa_frame-finish">Show list					
							</span><span class="loading-message" style="display:none"> <i class="fa fa-spinner fa-spin loading-message"></i> Loading...</span></label></td>
						<td class="value col-sm-12">
							<div id="picker_pa_frame-finish" style="display:none;" class="select swatch-control" data-type="frame">
							
						</div>
						</tr> 
						<?php
						} else {
						?>
									<tr class="row var-swatch alt">
						<td class="label col-sm-12"><label style="margin:10px auto" for="pa_frame-finish">Frame Finish <span class="load-fabric" style="display:none" data-type="frame" data-divid="picker_pa_frame-finish">Show list					
							</span><span class="loading-message" style="display:none"> <i class="fa fa-spinner fa-spin loading-message"></i> Loading...</span></label></td>
						<td class="value col-sm-12">
							<div id="picker_pa_frame-finish" style="display:none;" class="select swatch-control" data-type="frame">
							<?php		
		
								//$terms = get_terms( 'pa_frame-finish' );
	/*	$terms = get_terms( array(
    'taxonomy' => 'pa_frame-finish',
    'hide_empty' => false,
) );
 
if ( ! empty( $terms ) && ! is_wp_error( $terms ) ){
 
echo '<ul>';
 
foreach ( $terms as $term ) {
 
//echo '<li>' . $term->name . '</li>';
//echo '<li>' . $term->slug . '</li>';
$thumbnail_id = get_woocommerce_term_meta( $term->term_id, 'pa_frame-finish_swatches_id_photo', true );
$textureImg = wp_get_attachment_image_src( $thumbnail_id, 'swatches_image_size' ); 

?>
<div class="select-option swatch-wrapper" data-attribute="pa_frame-finish" data-value="<?php echo $term->name; ?>"><a href="#" style="width:32px;height:32px;" title="<?php echo $term->name; ?>" class="swatch-anchor"><img src="<?php echo $textureImg[0]; ?>" alt="" class="wp-post-image swatch-photopa_frame-finish_swatches_id swatch-img" width="32" height="32"></a></div>
<?php

}
 
echo '</ul>';
 
} */  

?>
							
							
							</div>
							<!--<div class="attribute_pa_frame-finish_picker_label swatch-label">&nbsp;</div><a class="reset_variations" href="#" style="visibility: hidden;">Clear</a>	-->					</td>
					</tr> <?php } ?>
							</tbody>
		</table>


		<div class="single_variation_wrap">
			<div class="woocommerce-variation single_variation" style="display: none;"></div><div class="woocommerce-variation-add-to-cart variations_button woocommerce-variation-add-to-cart-disabled">
	
		<!--<div class="quantity">
				<label class="screen-reader-text" for="quantity_603de27468b69">Louise Barstool - DS quantity</label>
		<input type="number" id="quantity_603de27468b69" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" placeholder="" inputmode="numeric">
			</div>
	
	<button type="submit" class="single_add_to_cart_button button alt disabled wc-variation-selection-needed">Send My Vision</button>-->
<div id="backtat"></div>
<div id="seattat"></div>
<div id="resultat"></div>

	<script>
		jQuery(document).ready(function($){

   $("body").on("click", "#picker_pa_back-fabric .select-option",function(){
		
		
        var dataId = $(this).attr("data-value");
		
		 document.getElementById("backtat").innerHTML = "<b>Back</b>: " + dataId;
		 document.getElementById("customback").value = dataId;
		 
    });
			 function filter_fabric(name,color,grade,pattern,supplier,material){
			 //if (color != 'any' || grade != 'any' || pattern != 'any' || supplier != 'any' || material != 'any' ) {
				jQuery('#picker_pa_seat-fabric .select-option').hide()
			 	jQuery('#picker_pa_back-fabric .select-option').hide()
			// }
			 
			if(name==''){
				if (grade == 'any' && jQuery('.grade-filter select').hasClass('has-limit-grade') ) {
					jQuery('.grade-filter select option').each(function(){
						if (jQuery(this).val() != 'any') {
							let option_grade = jQuery(this).val()
							jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
							jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
						}
					});
					
				} else {
					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
				}
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
			}else{
				if (grade == 'any' && jQuery('.grade-filter select').hasClass('has-limit-grade') ) {
					jQuery('.grade-filter select option').each(function(){
						if (jQuery(this).val() != 'any') {
							let option_grade = jQuery(this).val()
							jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();				
					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${option_grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
						}
					});
					
				} else {
					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();				
					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
				}
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_seat-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-name*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();				
// 					jQuery(`#picker_pa_back-fabric .select-option.swatch-wrapper[data-sku*="${name}"][data-color*="${color}"][data-grade*="${grade}"][data-pattern*="${pattern}"][data-supplier*="${supplier}"][data-material*="${material}"]`).show();
			}
			
			var count_back_option_showed = jQuery('#picker_pa_back-fabric .select-option.swatch-wrapper:not([style*="display: none"])').length;
				if(count_back_option_showed == 0 && jQuery('#picker_pa_back-fabric').find('.matching-message').length == 0){ 				if (jQuery('#picker_pa_back-fabric').closest('.row').find('.loading-message').is(":visible")) {
					
				} else {
					jQuery('#picker_pa_back-fabric').append('<p class="matching-message">No Matching Fabrics</p>');
				}
					
				}else if(count_back_option_showed != 0){
					jQuery('#picker_pa_back-fabric .matching-message').remove();
				}
				var count_seat_option_showed = jQuery('#picker_pa_seat-fabric .select-option.swatch-wrapper:not([style*="display: none"])').length;
				if(count_seat_option_showed == 0 && jQuery('#picker_pa_seat-fabric').find('.matching-message').length == 0){
				if (jQuery('#picker_pa_seat-fabric').closest('.row').find('.loading-message').is(":visible")) {
					
				} else {
					jQuery('#picker_pa_seat-fabric').append('<p class="matching-message">No Matching Fabrics</p>');
				}
				}else if(count_seat_option_showed != 0){
					jQuery('#picker_pa_seat-fabric .matching-message').remove();
				}
		}
	$('#picker_pa_back-fabric, #picker_pa_seat-fabric').on('scroll', function(e) {
				var elem = $(e.currentTarget);
				let total_image = $(this).find('.select-option').length
				let fabric_type = $(this).attr('data-type');
				let parent_id = $(this).attr('id');
				let current = $(this).closest('.row').find('span.load-fabric')
				var color = $('.color-filter select').val();			
					var grade = $('.grade-filter select').val();
					var pattern = $('.pattern-filter select').val();
					var supplier = $('.supplier-filter select').val();
					var material = $('.material-filter select').val();		
					var name = $('.sub-filter input#name-search').val().toLowerCase();
				let already_load = $(this).attr('data-alreadyload')
				if ($(this).scrollTop() + $(this).innerHeight() + 1>= $(this)[0].scrollHeight && $(this).hasClass('show_all') == false ) {
					$(this).attr('data-alreadyload', parseInt(already_load) + 20)
					run_load_fabric(current, parent_id, fabric_type, already_load, 20, grade, material, color, pattern, supplier, name, 'init')
				}
			} );
			$('.sub-filter select').change(function(){
				var color = $('.color-filter select').val();			
				var grade = $('.grade-filter select').val();
				var pattern = $('.pattern-filter select').val();
				var supplier = $('.supplier-filter select').val();
				var material = $('.material-filter select').val();		
				var name = $('.sub-filter input#name-search').val().toLowerCase();
				
				//filter_fabric(name,color,grade,pattern,supplier,material);	
				if ($('#picker_pa_back-fabric').length !=0) {
					if ($('#picker_pa_back-fabric').hasClass('show_all') == false) {
						$('#picker_pa_back-fabric').empty()
						$('#picker_pa_back-fabric').addClass('show_all')
						run_load_fabric( $('#picker_pa_back-fabric').closest('.row').find('span.load-fabric'), 'picker_pa_back-fabric', 'back', 0, '', 'any', 'any', 'any', 'any', 'any', 'any', 'filter');
						
					} else {
						filter_fabric(name,color,grade,pattern,supplier,material);
					}
				}
				if ($('#picker_pa_seat-fabric').length !=0 ) {
					if ($('#picker_pa_seat-fabric').hasClass('show_all') == false) {
						$('#picker_pa_seat-fabric').empty()
						$('#picker_pa_seat-fabric').addClass('show_all')
						run_load_fabric( $('#picker_pa_seat-fabric').closest('.row').find('span.load-fabric'), 'picker_pa_seat-fabric', 'seat', 0, '', 'any', 'any', 'any', 'any', 'any', 'any', 'filter')
					} else {
						filter_fabric(name,color,grade,pattern,supplier,material);
					}
					
				}
		});	
	 		var timer, value;
			$('.sub-filter input#name-search').bind('keyup', function(e) {
				clearTimeout(timer);
				var str = $(this).val();
				if (value != str) {
					timer = setTimeout(function() {
						value = str;
						e.preventDefault();
						var name = str.toLowerCase();
							
							var color = $('.color-filter select').val();			
							var grade = $('.grade-filter select').val();
							var pattern = $('.pattern-filter select').val();
							var supplier = $('.supplier-filter select').val();
							var material = $('.material-filter select').val();			
							if ($('#picker_pa_back-fabric').length !=0 ) {
								if ($('#picker_pa_back-fabric').hasClass('show_all') == false) {
									$('#picker_pa_back-fabric').addClass('show_all')
									$('#picker_pa_back-fabric').empty()
									run_load_fabric( $('#picker_pa_back-fabric').closest('.row').find('span.load-fabric'), 'picker_pa_back-fabric', 'back', 0, '', 'any', 'any', 'any', 'any', 'any', 'any', 'filter');
								} else {
									filter_fabric(name,color,grade,pattern,supplier,material);
								}
							}
							if ($('#picker_pa_seat-fabric').length !=0 ) {
								if ($('#picker_pa_seat-fabric').hasClass('show_all') == false) {
									$('#picker_pa_seat-fabric').addClass('show_all')									
									$('#picker_pa_seat-fabric').empty()
									run_load_fabric( $('#picker_pa_seat-fabric').closest('.row').find('span.load-fabric'), 'picker_pa_seat-fabric', 'seat', 0, '', 'any', 'any', 'any', 'any', 'any', 'any', 'filter')
								} else {
									filter_fabric(name,color,grade,pattern,supplier,material);
								}
							}
					}, 2000);
				}
			});
			function run_load_fabric(current, parent_id, fabric_type, offset, limit, grade_filter, material_filter, color_filter, pattern_filter, supplier_filter, name, ajax_type) {
			$('#'+parent_id).find('.no-product-found').remove()
			current.closest('label').find('.loading-message').show();
			$.ajax({
					type: 'POST',
					dataType: 'json',
					url: '<?php echo admin_url('admin-ajax.php')?>',
				  /*  url: '/wp-content/themes/indite-child/admin-ajax.php',*/
						action: 'load_fabric',
						type: fabric_type,
						offset: offset,
						grade_filter: grade_filter,
						material_filter: material_filter, 
						color_filter: color_filter,
						pattern_filter: pattern_filter,
						supplier_filter: supplier_filter,
						fabric_name: name,
						limit: limit,
						has_limit_grade: '<?php echo ($has_fabric_grade_limit == true) ? 'yes' : 'no';?>',
						post_id: <?php echo !empty($post) ? $post->ID : '';?>
					},
					success: function (response) {
					
						if(response.data.html!= '' ){
							$('#'+parent_id).append(response.data.html)	
							$('#'+parent_id).find('.no-product-found').remove()
						} else if (ajax_type != 'init' && $('#'+parent_id).find('.select-option').length == 0) {
							$('#'+parent_id).find('.no-product-found').remove()
							$('#'+parent_id).append('<p class="no-product-found">No fabric found</p>')
						}
						if(response.data.show_all == true){
							$('#'+parent_id).addClass('show_all')							
						}
						//document.addEventListener("DOMContentLoaded", function() {
						  var lazyloadImages;    

						  if ("IntersectionObserver" in window) {
							lazyloadImages = document.querySelectorAll(".lazy");
							var imageObserver = new IntersectionObserver(function(entries, observer) {
							  entries.forEach(function(entry) {
								if (entry.isIntersecting) {
								  var image = entry.target;
								  image.src = image.dataset.src;

								  image.classList.remove("lazy");
								  imageObserver.unobserve(image);
								}
							  });
							});

							lazyloadImages.forEach(function(image) {
							  imageObserver.observe(image);
							});
						  } else {  
							var lazyloadThrottleTimeout;
							lazyloadImages = document.querySelectorAll(".lazy");

							function lazyload () {
							  if(lazyloadThrottleTimeout) {
								clearTimeout(lazyloadThrottleTimeout);
							  }    

							  lazyloadThrottleTimeout = setTimeout(function() {
								var scrollTop = window.pageYOffset;
								lazyloadImages.forEach(function(img) {
									if(img.offsetTop < (window.innerHeight + scrollTop)) {
									  img.src = img.dataset.src;
									  img.classList.remove('lazy');
									}
								});
								if(lazyloadImages.length == 0) { 
								  document.removeEventListener("scroll", lazyload);
								  window.removeEventListener("resize", lazyload);
								  window.removeEventListener("orientationChange", lazyload);
								}
							  }, 20);
							}

							document.addEventListener("scroll", lazyload);
							window.addEventListener("resize", lazyload);
							window.addEventListener("orientationChange", lazyload);

						  }
/*})*/
						current.closest('label').find('.loading-message').hide();
	  					$('#'+parent_id).show();
						if(fabric_type == 'seat' || fabric_type == 'back'){
							$('.custom-fabric-filter').show();
						}
						if (ajax_type == 'filter' || (jQuery('.grade-filter select').hasClass('has-limit-grade') && (fabric_type == 'seat' || fabric_type == 'back'))) {
							var color = $('.color-filter select').val();			
							var grade = $('.grade-filter select').val();
							var pattern = $('.pattern-filter select').val();
							var supplier = $('.supplier-filter select').val();
							var material = $('.material-filter select').val();		
							var name = $('.sub-filter input#name-search').val().toLowerCase();

							filter_fabric(name,color,grade,pattern,supplier,material);	
						}
					}
				})
		}
	
		$('span.load-fabric').each(function(e){
			var current=$(this);
			var fabric_type = $(this).attr('data-type');
			var parent_id = $(this).attr('data-divid');
			var color = jQuery('.color-filter select').val();			
				var grade = jQuery('.grade-filter select').val();
				var pattern = jQuery('.pattern-filter select').val();
				var supplier = jQuery('.supplier-filter select').val();
				var material = jQuery('.material-filter select').val();		
				var name = jQuery('.sub-filter input#name-search').val().toLowerCase();
			if($('#'+parent_id).find('.select-option').length == 0){
				current.closest('label').find('.loading-message').show();
				$('#'+parent_id).attr('data-alreadyload', 20)
				run_load_fabric(current, parent_id, fabric_type, 0, 20, grade, material, color, pattern, supplier, name, 'init') 
			}else{
				$('#'+parent_id).show();
				if(fabric_type == 'seat' || fabric_type == 'back'){
							$('.custom-fabric-filter').show();
				}
			}
			
		})
// 		$('span.load-fabric').each(function(e){
// 			var current=$(this);
// 			var fabric_type = $(this).attr('data-type');
// 			var parent_id = $(this).attr('data-divid');
// 			if($('#'+parent_id).find('.select-option').length == 0){
// 				current.closest('label').find('.loading-message').show();
// 				$.ajax({
// 					type: 'POST',
// 					dataType: 'json',
// 					url: '<?php// echo admin_url('admin-ajax.php')?>',
// 					data: {
// 						action: 'load_fabric',
// 						type: fabric_type,
// 					},
// 					success: function (response) {
					
// 						if(response.html!=''){
// 							$('#'+parent_id).append(response.data.html)
// 						}
// 						//document.addEventListener("DOMContentLoaded", function() {
//   var lazyloadImages;    

//   if ("IntersectionObserver" in window) {
// 	  console.log('in');
//     lazyloadImages = document.querySelectorAll(".lazy");
//     var imageObserver = new IntersectionObserver(function(entries, observer) {
//       entries.forEach(function(entry) {
//         if (entry.isIntersecting) {
//           var image = entry.target;
//           image.src = image.dataset.src;
			
//           image.classList.remove("lazy");
//           imageObserver.unobserve(image);
//         }
//       });
//     });

//     lazyloadImages.forEach(function(image) {
//       imageObserver.observe(image);
//     });
//   } else {  
// 	   console.log('not');
//     var lazyloadThrottleTimeout;
//     lazyloadImages = document.querySelectorAll(".lazy");
    
//     function lazyload () {
//       if(lazyloadThrottleTimeout) {
//         clearTimeout(lazyloadThrottleTimeout);
//       }    

//       lazyloadThrottleTimeout = setTimeout(function() {
//         var scrollTop = window.pageYOffset;
//         lazyloadImages.forEach(function(img) {
//             if(img.offsetTop < (window.innerHeight + scrollTop)) {
//               img.src = img.dataset.src;
//               img.classList.remove('lazy');
//             }
//         });
//         if(lazyloadImages.length == 0) { 
//           document.removeEventListener("scroll", lazyload);
//           window.removeEventListener("resize", lazyload);
//           window.removeEventListener("orientationChange", lazyload);
//         }
//       }, 20);
//     }

//     document.addEventListener("scroll", lazyload);
//     window.addEventListener("resize", lazyload);
//     window.addEventListener("orientationChange", lazyload);
	  	
//   }
// /*})*/
// 						current.closest('label').find('.loading-message').hide();
// 	  $('#'+parent_id).show();

// 					}
// 				})
// 			}else{
// 				$('#'+parent_id).show();
// 			}
			
// 		})
		
});
	$(document).ready(function(){
   $("body").on("click","#picker_pa_back-fabric .select-option", function(){
		
		
        var dataId = $(this).attr("data-value");
		console.log(dataId);
		 document.getElementById("backtat").innerHTML = "<b>Back</b>: " + dataId;
		 document.getElementById("customback").value = dataId;
		 
    });
});
	
	$(document).ready(function(){
    $("body").on("click","#picker_pa_seat-fabric .select-option",function(){
        var dataId = $(this).attr("data-value");
		
		 document.getElementById("seattat").innerHTML = "<b>Seat</b>: " + dataId;
		 document.getElementById("customseat").value = dataId;
		 
    });
});
	
$(document).ready(function(){
     $("body").on("click","#picker_pa_frame-finish .select-option", function(){
        var dataId = $(this).attr("data-value");
		
		 document.getElementById("resultat").innerHTML = "<b>Frame</b>: " + dataId;
		 document.getElementById("custom").value = dataId;
		 
    });
});
</script>


	
</div>
		</div>
	
	</form>
	
	<button onclick="window.print()" style="background-color: #981c1e;border: 1px solid;font-weight: 600;color: white;text-decoration: none;padding: 10px;border-radius: 5%;"><?php the_field('button_design_studio', 'option'); ?></button>
	
	<?php 
	$this_url = get_permalink();
	 $that_url = substr($this_url, 0, strpos($this_url, '-ds'));
	$that_postid = url_to_postid( $that_url );
	
	?>
	
	<?php if ( get_field('dimensions_1', $that_postid) ) { ?>
	
	<div class="row py-4 dimensions-info" style="margin:0px;width:100%">
	<h2 class="col-sm-12" style="padding-left:0px;">Dimensions</h2>
	<div class="col-3"><img src="/wp-content/uploads/2020/11/aiches_01.jpg" /><br /><?php the_field('dimensions_1', $that_postid); ?></div>
	<div class="col-3"><img src="/wp-content/uploads/2020/11/aiches_02.jpg" /><br /><?php the_field('dimensions_2', $that_postid); ?></div>
	<div class="col-3"><img src="/wp-content/uploads/2020/11/aiches_03.jpg" /><br /><?php the_field('dimensions_3', $that_postid); ?></div>
	<div class="col-3"><img src="/wp-content/uploads/2020/11/aiches_04.jpg" /><br /><?php the_field('dimensions_4', $that_postid); ?></div>
	</div>
	<?php } ?>