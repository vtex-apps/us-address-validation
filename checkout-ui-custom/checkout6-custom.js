// us address validation



class _addressValidation {
	constructor() {
		this.orderForm = null
		this.validatedAddress = null
		this.checkoutAddress = null
    this.lang = null

		this._addressValidationStatus = false
		this._addressValidationId = false
	}

  debounce(func,wait) {
    let timeout

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

	bind() {
		const _this = this

		$("body").on("click", ".addressValidation__box--addressOption", function(e) {
			$(".addressValidation__box--addressOption").removeClass("ischecked")
			$(this).addClass("ischecked")
		})

		$("body").on("click", ".js-addressValidation__box--button", function(e) {
			e.preventDefault()
			e.stopPropagation()
			_this.saveAddress()

		})


	}

	closeModal() {
		const _this = this
		$(".addressValidation__box").slideUp(500, function() {
			$(".addressValidation__box").remove()
			_this._addressValidationStatus = true
			//_this._addressValidationId = _this.orderForm.shippingData.selectedAddresses[0].addressId
		})

    _this.desactiveAddressValidation();


	}

	showInvalidAddressModal() {
		const _this = this

    const _modalHTML = `
			<div class="addressValidation__box">
				<div class="addressValidation__box--wrap">
					<h4 class="addressValidation__box--title">Address Verification</h4>
					<p class="addressValidation__box--text">
            <span class="icon">x</span>
            <b>We couldn't find your address</b>
          </p>
					<p class="addressValidation__box--text">Please review it. Bear in mind that we will might be unabled to send your order.</p>
					<button class="addressValidation__box--button js-addressValidation__box--close">Continue with this address</button>
				</div>
			</div>
		`

		if($(".addressValidation__box").length) return
		$("body").append(_modalHTML)
	}

	showModal() {
		const _this = this


		const _modalHTML = `
			<div class="addressValidation__box">
				<div class="addressValidation__box--wrap">
					<h4 class="addressValidation__box--title">Address Verification</h4>
					<p class="addressValidation__box--text">
            <span class="icon"><svg viewBox="0 0 15 17"><g stroke="#231F20" fill="#231F20" stroke-width="1"><path d="M.5 16.5v-5a6.81 6.81 0 015-2c3 0 4 2 6 2a5.35 5.35 0 003-1v-9a5.35 5.35 0 01-3 1c-2 0-3-2-6-2a6.81 6.81 0 00-5 2v9" fill="#FEFEFE" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></span>
            <b>The address you entered may be undeliverable. Please make sure it is correct before proceeding.</b>
          </p>
					<form class="addressValidation__box--addresses">
						<label class="addressValidation__box--addressOption">
							<p>You entered:</p>
							<input type="radio" name="addressvalidation"/>
							<span>
								${_this.checkoutAddress.street}
								<br/>
								${_this.checkoutAddress.city ? `${_this.checkoutAddress.city}, ` : ""}${_this.checkoutAddress.state} ${_this.checkoutAddress.postalCode}
							</span>
              <b>*This address may be undeliverable</b>
						</label>
						<label class="addressValidation__box--addressOption addressValidation__box--addressOption--validated ischecked">
							<p>Suggested address:</p>
							<input type="radio" name="addressvalidation" checked="checked"/>
							<span>
								${_this.validatedAddress.components.primary_number} ${_this.validatedAddress.components.street_name} ${_this.validatedAddress.components.street_suffix ? _this.validatedAddress.components.street_suffix : ""}
								<br/>
								${_this.validatedAddress.components.default_city_name === "Null" ? "" : _this.validatedAddress.components.default_city_name}, ${_this.validatedAddress.components.state_abbreviation} ${_this.validatedAddress.components.zipcode}
							</span>
						</label>
					</form>
					<button class="addressValidation__box--button js-addressValidation__box--button">Continue with this address</button>
				</div>
			</div>
		`

		if($(".addressValidation__box").length) return
		$("#shipping-data").after(_modalHTML)
	}

	saveAddress() {
		const _this = this

		if(!$(".addressValidation__box--addressOption--validated").hasClass("ischecked")) {
			_this.closeModal()
      _this.desactiveAddressValidation();
			return
		}




		// fetch(`/api/checkout/pub/orderForm/${_this.orderForm.orderFormId}/attachments/shippingData`,
    //   {
    //     "credentials":"include",
    //     "headers":{
    //        "accept":"application/json, text/javascript, */* q=0.01",
    //        "cache-control":"no-cache",
    //        "content-type":"application/json charset=UTF-8",
    //        "pragma":"no-cache",
    //        "sec-fetch-mode":"cors",
    //        "sec-fetch-site":"same-origin",
    //        "x-requested-with":"XMLHttpRequest"
    //     },
    //     "referrerPolicy":"no-referrer-when-downgrade",
    //     "body":JSON.stringify({
    //       'selectedAddresses':[
    //          {
    //             'addressType':'residential',
    //             'receiverName':'',
    //             'addressId':'',
    //             'isDisposable':true,
    //             'postalCode':_this.validatedAddress.components.zipcode,
    //             'city':_this.validatedAddress.components.default_city_name,
    //             'state':_this.validatedAddress.components.state_abbreviation,
    //             'country':_this.checkoutAddress.country,
    //             'geoCoordinates':[ _this.validatedAddress.metadata.longitude, _this.validatedAddress.metadata.latitude ],
    //             'street':_this.validatedAddress.delivery_line_1,
    //             'number':_this.validatedAddress.components.primary_number||"",
    //             'neighborhood':'',
    //             'complement':_this.checkoutAddress.complement,
    //             'reference':null,
    //             'addressQuery':`${_this.validatedAddress.delivery_line_1} ${_this.validatedAddress.last_line}`
    //          }
    //       ],
    //       'clearAddressIfPostalCodeNotFound':false,
    //    }),
    //     "method":"POST",
    //     "mode":"cors"
    //   })

    var shippingInfo = {
      "selectedAddresses": [{
            "addressType": "residential",
            "receiverName": "",
            "isDisposable": true,
            "postalCode": _this.validatedAddress.components.zipcode,
            "city": _this.validatedAddress.components.default_city_name,
            "state": this.validatedAddress.components.state_abbreviation,
            "country": _this.checkoutAddress.country,
            "street":_this.validatedAddress.delivery_line_1,
            "number": _this.validatedAddress.components.primary_number||"",
            "neighborhood": "",
            "complement": _this.checkoutAddress.complement,
            "reference": null,
            "geoCoordinates": [ _this.validatedAddress.metadata.longitude, _this.validatedAddress.metadata.latitude ],
            "addressQuery": `${_this.validatedAddress.delivery_line_1} ${_this.validatedAddress.last_line}`
        }],
      "clearAddressIfPostalCodeNotFound": false
    }

    _this.triggerEvent("saveAddress")
    vtexjs.checkout.sendAttachment("shippingData", {}).done(function(orderForm) {
      $("button.vtex-front-messages-close-all.close").trigger("click");
      $(".vtex-omnishipping-1-x-warning").hide();
      _this.closeModal()
      vtexjs.checkout.sendAttachment("shippingData", shippingInfo).done(function(orderForm) {
        _this.desactiveAddressValidation()
        _this.triggerEvent("savedAddress")
      })
      .fail(function(error) {
        console.error(`Something went wrong: ${error}`)
      })
    })
	}

  ifAllUnavailable(orderForm) {
    if(orderForm.items.filter( item => item.availability == "cannotBeDelivered").length == orderForm.items.length) {
      $(".orderform-template-holder .step.shipping-data .box-step").hide();
    } else {
      $(".orderform-template-holder .step.shipping-data .box-step").show();
    }
  }

  triggerEvent(evt) {
    $(window).trigger(`addressValidation__${evt}`)
  }

	validate(orderForm) {
		const _this = this

		_this.orderForm = orderForm

		try {

			if(
				_this.orderForm &&
				_this.orderForm.shippingData &&
				_this.orderForm.shippingData.selectedAddresses.length &&
				!_this._addressValidationStatus &&
        !(~_this.orderForm.shippingData.selectedAddresses[0].city.indexOf('*')) &&
				(_this.orderForm.shippingData.selectedAddresses[0].city || _this.orderForm.shippingData.selectedAddresses[0].neighborhood) &&
				_this.orderForm.shippingData.selectedAddresses[0].postalCode &&
				_this.orderForm.shippingData.selectedAddresses[0].state &&
				_this.orderForm.shippingData.selectedAddresses[0].street

			) {

				_this.checkoutAddress = _this.orderForm.shippingData.selectedAddresses[0]

        _this.triggerEvent("validate")
				fetch(`/smartystreets-validation/?street=${_this.checkoutAddress.street}&city=${_this.checkoutAddress.city ? _this.checkoutAddress.city : _this.checkoutAddress.neighborhood}&state=${_this.checkoutAddress.state}&zipcode=${_this.checkoutAddress.postalCode}`,
				{
          method: 'GET',
          redirect: 'follow'
        })
				.then(response => response.text())
				.then(function(result) {

          _this.triggerEvent("validated")
          _this.validatedAddress = JSON.parse(result)[0]

          if(
            (typeof _this.validatedAddress == "undefined") || (
            _this.validatedAddress.components &&
            _this.validatedAddress.components.default_city_name === _this.checkoutAddress.city &&
            _this.validatedAddress.components.zipcode === _this.checkoutAddress.postalCode &&
            _this.validatedAddress.components.state_abbreviation === _this.checkoutAddress.state &&
            _this.validatedAddress.delivery_line_1 === _this.checkoutAddress.street)
          ) return


					if(_this.validatedAddress.analysis.dpv_match_code || _this.validatedAddress.analysis.dpv_footnotes=="A1") {
						_this.showModal()
            _this.activeAddressValidation();
            _this.triggerEvent("showModal")
					} else {
						//_this.showInvalidAddressModal()
					}


          _this.ifAllUnavailable(_this.orderForm);

        })
				.catch(function(e) {
          console.error(e);
        })


			}
		} catch(e) {
			console.error(e)
      _this.desactiveAddressValidation();
		}
	}

  activeAddressValidation() {

    $("body").addClass("js-addressValidation-active")
  }

  desactiveAddressValidation() {

    $("body").removeClass("js-addressValidation-active")
  }

	compareSelectAddresses(oldOrderForm, orderFormUpdated) {
		const _this = this

		if(JSON.stringify(orderFormUpdated.shippingData.selectedAddresses[0]) !== JSON.stringify(oldOrderForm.shippingData.selectedAddresses[0])) {
			_this._addressValidationStatus = false
		} else {
			_this._addressValidationStatus = true
		}
	}

	init() {
		const _this = this

    $("body").addClass("js-addressValidation-on")
    _this.bind()

		$(window).on('orderFormUpdated.vtex load', function(evt, orderForm) {

      if(_this.orderForm && (_this.orderForm !== orderForm) && _this.orderForm.shippingData && _this.orderForm.shippingData.selectedAddresses ) _this.compareSelectAddresses(_this.orderForm, orderForm)

			_this.orderForm = orderForm
			_this.lang = vtex ? vtex.i18n.locale : "en"

			if(window.location.hash==="#/shipping" || window.location.hash==="#/payment") {
				_this.debounce(function() {
					_this.validate(orderForm)
				}, 350)()
			}
		})

	}
}

window.addressValidation = new _addressValidation()
$(window).load(() => {addressValidation.init()})

