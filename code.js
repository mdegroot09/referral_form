var updateFormUsingReferralType = () => {
  var referralType = Xrm.Page.data.entity.attributes.get('homie_verticalselection').getSelectedOption().text

  // show tour location type only for buyer referrals
  if (referralType == 'Buyer'){
    // show tour location type
    Xrm.Page.ui.controls.get('homie_tourlocationtype').setVisible(true)
    updateLocationFields()
  } else {
    // hide and reset tour location type
    Xrm.Page.ui.controls.get('homie_tourlocationtype').setVisible(false)
    Xrm.Page.data.entity.attributes.get('homie_tourlocationtype').setValue(false)
    updateLocationFields()
  }

  hideAddress2Composites()
}

var updateReferralFieldsWithContactInfo = () => {
  hideAddress2Composites()
  var contact = Xrm.Page.data.entity.attributes.get("homie_existingcontact").getValue()

  if (contact){
    return getContactInfo(contact[0].id)
  } else {
    return clearReferralContactFields()
  }
}

var getContactInfo = async (contactid) => {
  // remove curly braces if present
  contactid = contactid.split('').filter((a) => {
    return (a != '{' && a != '}')
  }).join('')

  var url = 'https://homie-sb.crm.dynamics.com/api/data/v9.0/contacts(' + contactid + ')?$select=firstname,lastname,mobilephone,emailaddress1,_originatingleadid_value'
  var otherParams = {
    headers: getHeaders(),
    method: "GET"
  }
  var res = await fetch(url, otherParams)
  var data = await res.json()

  // update input fields
  updateContactRelatedField('firstname', data.firstname)
  updateContactRelatedField('lastname', data.lastname)
  updateContactRelatedField('mobilephone', data.mobilephone)
  updateContactRelatedField('emailaddress1', data.emailaddress1)

  // update Topic with full name
  var fullname = data.firstname + ' ' + data.lastname
  updateContactRelatedField('subject', fullname)

  return getMarket(data)
}

var getMarket = async (data) => {
  // remove curly braces if present
  var leadid = data['_originatingleadid_value']
  leadid = leadid.split('').filter((a) => {
    return (a != '{' && a != '}')
  }).join('')

  // get market from contact's originating lead
  var url = 'https://homie-sb.crm.dynamics.com/api/data/v9.0/leads(' + leadid + ')?$select=homie_market'
  var otherParams = {
    headers: getHeaders(),
    method: "GET"
  }
  var res = await fetch(url, otherParams)
  var data = await res.json()
  updateContactRelatedField('homie_market', data.homie_market)
}

var getHeaders = () => {
  return {
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json",
    "Prefer": "odata.maxpagesize=10, odata.include-annotations=OData.Community.Display.V1.FormattedValue"
  }
}

var updateContactRelatedField = (field, val) => {
  Xrm.Page.data.entity.attributes.get(field).setValue(val)
}

var clearReferralContactFields = () => {
  // clear all fields
  updateContactRelatedField('firstname','')
  updateContactRelatedField('lastname','')
  updateContactRelatedField('mobilephone','')
  updateContactRelatedField('emailaddress1','')
  updateContactRelatedField('homie_market','')
  updateContactRelatedField('subject','')
}

var hideAddress2Composites = () => {
  setTimeout(() => {
    try {
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line1").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line2").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line3").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_city").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_stateorprovince").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_postalcode").setVisible(false)
    }
    catch(e){}
  }, 100);
}

var updateSubject = () => {
  // update subject field aka "Topic"
  var firstname = Xrm.Page.data.entity.attributes.get("firstname").getValue()
  var lastname = Xrm.Page.data.entity.attributes.get("lastname").getValue()

  // only use fields with a value, otherwise use empty string
  var fullname
  if (firstname && lastname){
    fullname = firstname + ' ' + lastname
  } else if (firstname){
    fullname = firstname
  } else if (lastname){
    fullname = lastname
  } else {
    fullname = ''
  }

  fullname = fullname.trim()
  updateContactRelatedField('subject', fullname)
}

var updateLocationFields = () => {
  var locationType = Xrm.Page.data.entity.attributes.get('homie_tourlocationtype').getValue()

  // hide streets 1-3 fields if "General area"
  if (locationType === true) {
    Xrm.Page.ui.controls.get('address2_line1').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line2').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line3').setVisible(false)
  } else {
    Xrm.Page.ui.controls.get('address2_line1').setVisible(true)
    Xrm.Page.ui.controls.get('address2_line2').setVisible(true)
    Xrm.Page.ui.controls.get('address2_line3').setVisible(true)
  }

  hideAddress2Composites()
}