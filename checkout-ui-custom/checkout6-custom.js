// us address validation

const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

class _addressValidation {
	constructor() {
		this.orderForm = null;
		this.validatedAddress = null;
		this.checkoutAddress = null;
    this.lang = null;

		this._addressValidationStatus = false;
		this._addressValidationId = false;
	}

	bind() {
		const _this = this;

		$("body").on("click", ".addressValidation__modal--addressOption", function(e) {
			$(".addressValidation__modal--addressOption").removeClass("ischecked");
			$(this).addClass("ischecked");
		});

		$("body").on("click", ".addressValidation__modal--close", function(e) {
			e.preventDefault();
			e.stopPropagation();
			_this.closeModal();
		});

		$("body").on("click", ".js-addressValidation__modal--button", function(e) {
			e.preventDefault();
			e.stopPropagation();
			_this.saveAddress();
		});


	}

	closeModal() {
		const _this = this;
		$(".addressValidation__modal").fadeOut(300, function() {
			$(".addressValidation__modal").remove();
			_this._addressValidationStatus = true;
			_this._addressValidationId = _this.orderForm.shippingData.selectedAddresses[0].addressId;
		})
	}

	showModal() {
		const _this = this;

		const _modalHTML = `
			<div class="addressValidation__modal">
				<div class="addressValidation__modal--bg"></div>
				<div class="addressValidation__modal--wrap">
					<h4 class="addressValidation__modal--title">Address Verification</h4>
					<button class="addressValidation__modal--close">x</button>
					<p class="addressValidation__modal--text">Your address is might wrong.</p>
					<form class="addressValidation__modal--addresses"> 
						<label class="addressValidation__modal--addressOption">
							<p>You entered:</p>
							<input type="radio" name="addressvalidation"/>
							<span>
								${_this.checkoutAddress.street} 
								<br/>
								${_this.checkoutAddress.city}, ${_this.checkoutAddress.state} ${_this.checkoutAddress.postalCode}
							</span>
						</label>
						<label class="addressValidation__modal--addressOption addressValidation__modal--addressOption--validated ischecked">
							<p>We suggest:</p>
							<input type="radio" name="addressvalidation" checked="checked"/>
							<span>
								${_this.validatedAddress.components.primary_number} ${_this.validatedAddress.components.street_name} ${_this.validatedAddress.components.street_suffix}
								<br/>
								${_this.validatedAddress.components.default_city_name}, ${_this.validatedAddress.components.state_abbreviation} ${_this.validatedAddress.components.zipcode}
							</span>
						</label>
					</form>
					<button class="addressValidation__modal--button js-addressValidation__modal--button">Continue with this address</button>
				</div>
			</div>
		`;

		if($(".addressValidation__modal").length) return
		$("body").append(_modalHTML);
	}

	saveAddress() {
		const _this = this;

		if(!$(".addressValidation__modal--addressOption--validated").hasClass("ischecked")) {
			_this.closeModal();
			return;
		}

		fetch(`/api/checkout/pub/orderForm/${_this.orderForm.orderFormId}/attachments/shippingData`, 
      {
        "credentials":"include",
        "headers":{
           "accept":"application/json, text/javascript, */*; q=0.01",
           "cache-control":"no-cache",
           "content-type":"application/json; charset=UTF-8",
           "pragma":"no-cache",
           "sec-fetch-mode":"cors",
           "sec-fetch-site":"same-origin",
           "x-requested-with":"XMLHttpRequest"
        },
        "referrerPolicy":"no-referrer-when-downgrade",
        "body":JSON.stringify({
          'selectedAddresses':[
             {
                'addressType':'residential',
                'receiverName':'',
                'addressId':"",
                'isDisposable':true,
                'postalCode':_this.validatedAddress.components.zipcode,
                'city':_this.validatedAddress.components.city_name,
                'state':_this.validatedAddress.components.state_abbreviation,
                'country':"USA",
                'geoCoordinates':[_this.validatedAddress.metadata.latitude, _this.validatedAddress.metadata.longitude],
                'street':_this.validatedAddress.delivery_line_1,
                'number':_this.validatedAddress.components.primary_number||"",
                'neighborhood':_this.validatedAddress.components.default_city_name,
                'complement':_this.checkoutAddress.complement,
                'reference':null,
                'addressQuery':`${_this.validatedAddress.delivery_line_1} ${_this.validatedAddress.last_line}`
             }
          ],
          'clearAddressIfPostalCodeNotFound':false,
       }),
        "method":"POST",
        "mode":"cors"
      })
      .then(response => response.json())
      .then(function(data) {
          if(data.error) {
            alert(`Something went wrong: ${data.error.message}`);
          } else {
            vtexjs.checkout.getOrderForm()
            .done(function(order) {
							_this.closeModal()
            });
          }
          
      });
	}

	validate(orderForm) {
		const _this = this;

		_this.orderForm = orderForm;

		try {
			if( 
				_this.orderForm && 
				_this.orderForm.shippingData && 
				_this.orderForm.shippingData.selectedAddresses.length &&
				_this.orderForm.shippingData.selectedAddresses[0].isDisposable &&
				!_this._addressValidationStatus &&
				(_this._addressValidationId != _this.orderForm.shippingData.selectedAddresses[0].addressId)
				
			) {
				
				_this.checkoutAddress = _this.orderForm.shippingData.selectedAddresses[0];

				
				fetch(`/smartystreets-validation/?street=${_this.checkoutAddress.street}&city=${_this.checkoutAddress.neighborhood}&state=${_this.checkoutAddress.state}&zipcode=${_this.checkoutAddress.postalCode}`, 
				{
          method: 'GET',
          redirect: 'follow'
        })
				.then(response => response.text())
				.then(function(result) {

          _this.validatedAddress = JSON.parse(result)[0];

          if(
            _this.validatedAddress.components.default_city_name == _this.checkoutAddress.city &&
            _this.validatedAddress.components.zipcode == _this.checkoutAddress.postalCode &&
            _this.validatedAddress.components.state_abbreviation == _this.checkoutAddress.state &&
            _this.validatedAddress.delivery_line_1 == _this.checkoutAddress.street
          ) return;

          _this.showModal();

        })
				.catch(error => console.log('error', error));


				
				
			}
		} catch(e) {
			console.error(e)
		} 
	}

	compareSelectAddresses(oldOrderForm, orderFormUpdated) {
		const _this = this;
		if(oldOrderForm.shippingData.selectedAddresses[0] != orderFormUpdated.shippingData.selectedAddresses[0]) _this._addressValidationStatus = false;
	}

	init() {
		const _this = this;


		$(window).on('orderFormUpdated.vtex', function(evt, orderForm) {

      if(_this.orderForm) _this.compareSelectAddresses(_this.orderForm, orderForm);

			_this.orderForm = orderForm;
			_this.lang = vtex ? vtex.i18n.locale : "en";
      _this.bind();

			if(window.location.hash=="#/shipping" || window.location.hash=="#/payment") {
				debounce(function() {
					_this.validate(orderForm);
				}, 250)();
			}
		});

	}
}

window.addressValidation = new _addressValidation()
addressValidation.init(); 
