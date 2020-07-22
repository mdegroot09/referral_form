let updateFormUsingReferralType = () => {
  let referralType = Xrm.Page.data.entity.attributes.get('homie_verticalselection').getSelectedOption()

  // show form only after referral type selection
  if (referralType){
    return showForm()
  } else {
    return hideForm()
  }
}

let updateReferralFieldsWithContactInfo = () => {
  // hideAddress2Composites()
  let contact = Xrm.Page.data.entity.attributes.get("homie_existingcontact").getValue()

  if (contact){
    return getContactInfo(contact[0].id)
  } else {
    return clearReferralContactFields()
  }
}

let getContactInfo = async (contactid) => {
  // remove curly braces if present
  contactid = contactid.split('').filter((a) => {
    return (a != '{' && a != '}')
  }).join('')

  let url = 'https://homie-sb.crm.dynamics.com/api/data/v9.0/contacts(' + contactid + ')?$select=firstname,lastname,mobilephone,emailaddress1,_originatingleadid_value'
  let otherParams = {
    headers: getHeaders(),
    method: "GET"
  }
  let res = await fetch(url, otherParams)
  let data = await res.json()

  // update input fields
  setFieldValue('firstname', data.firstname)
  setFieldValue('lastname', data.lastname)
  setFieldValue('mobilephone', data.mobilephone)
  setFieldValue('emailaddress1', data.emailaddress1)

  // update Topic with full name
  let fullname = data.firstname + ' ' + data.lastname
  setFieldValue('subject', fullname)

  return getMarket(data)
}

let getMarket = async (data) => {
  // remove curly braces if present
  let leadid = data['_originatingleadid_value']
  leadid = leadid.split('').filter((a) => {
    return (a != '{' && a != '}')
  }).join('')

  // get market from contact's originating lead
  let url = 'https://homie-sb.crm.dynamics.com/api/data/v9.0/leads(' + leadid + ')?$select=homie_market'
  let otherParams = {
    headers: getHeaders(),
    method: "GET"
  }
  let res = await fetch(url, otherParams)
  data = await res.json()
  return setFieldValue('homie_market', data.homie_market)
}

let getHeaders = () => {
  return {
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json",
    "Prefer": "odata.maxpagesize=10, odata.include-annotations=OData.Community.Display.V1.FormattedValue"
  }
}

let setFieldValue = (field, val) => {
  Xrm.Page.data.entity.attributes.get(field).setValue(val)
}

let clearReferralContactFields = () => {
  // clear all fields
  setFieldValue('firstname','')
  setFieldValue('lastname','')
  setFieldValue('mobilephone','')
  setFieldValue('emailaddress1','')
  setFieldValue('homie_market','')
  setFieldValue('subject','')
}

let hideAddress2Composites = () => {
  setTimeout(() => {
    try {
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line1").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line2").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_line3").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_city").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_stateorprovince").setVisible(false)
      Xrm.Page.ui.controls.get("address2_composite_compositionLinkControl_address2_postalcode").setVisible(false)
    }
    catch(e){
      console.log('address 2 composites not found')
    }
  }, 100);
}

let updateSubject = () => {
  // update subject field aka "Topic"
  let firstname = Xrm.Page.data.entity.attributes.get("firstname").getValue()
  let lastname = Xrm.Page.data.entity.attributes.get("lastname").getValue()

  // only use fields with a value, otherwise use empty string
  let fullname
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
  return setFieldValue('subject', fullname)
}

let showHideLocationFields = () => {
  let referralType = Xrm.Page.data.entity.attributes.get('homie_verticalselection').getSelectedOption()
  let locationType = Xrm.Page.data.entity.attributes.get('homie_tourlocationtype').getValue()
  
  if (!referralType){
    Xrm.Page.ui.controls.get('address2_line1').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line2').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line3').setVisible(false)
    Xrm.Page.ui.controls.get('address2_city').setVisible(false)
    Xrm.Page.ui.controls.get('homie_countieslist').setVisible(false)
    Xrm.Page.ui.controls.get('address2_postalcode').setVisible(false)
  }  

  // hide streets 1-3 fields if "General area" or if referralType 
  else if (locationType === true) {
    Xrm.Page.ui.controls.get('address2_line1').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line2').setVisible(false)
    Xrm.Page.ui.controls.get('address2_line3').setVisible(false)
    Xrm.Page.ui.controls.get('address2_city').setVisible(true)
    Xrm.Page.ui.controls.get('homie_countieslist').setVisible(true)
    Xrm.Page.ui.controls.get('address2_postalcode').setVisible(true)
  } 

  else {
    Xrm.Page.ui.controls.get('address2_line1').setVisible(true)
    Xrm.Page.ui.controls.get('address2_line2').setVisible(true)
    Xrm.Page.ui.controls.get('address2_line3').setVisible(true)
    Xrm.Page.ui.controls.get('address2_city').setVisible(true)
    Xrm.Page.ui.controls.get('homie_countieslist').setVisible(true)
    Xrm.Page.ui.controls.get('address2_postalcode').setVisible(true)
  }

  // return hideAddress2Composites()
}

let showHideLocationType = () => {
  let referralType = Xrm.Page.data.entity.attributes.get('homie_verticalselection').getSelectedOption()
  
  if (referralType && referralType.text == 'Buyer'){
    Xrm.Page.ui.controls.get('homie_tourlocationtype').setVisible(true)
  }
  else {
    Xrm.Page.ui.controls.get('homie_tourlocationtype').setVisible(false)
    Xrm.Page.data.entity.attributes.get('homie_tourlocationtype').setValue(false)
  }

}

let showForm = () => {
  Xrm.Page.ui.controls.get('homie_isthisahomieclient').setVisible(true)
  Xrm.Page.ui.controls.get('leadsourcecode').setVisible(true)
  
  showLockNameFields()
  showHideLocationFields()
  showHideLocationType()

  Xrm.Page.ui.controls.get('description').setVisible(true)
}

let hideForm = () => {
  Xrm.Page.ui.controls.get('homie_isthisahomieclient').setVisible(false)
  Xrm.Page.ui.controls.get('leadsourcecode').setVisible(false)
  
  showLockNameFields()
  showHideLocationFields()
  showHideLocationType()

  Xrm.Page.ui.controls.get('description').setVisible(false)
}

let showLockNameFields = () => {
  let referralType = Xrm.Page.data.entity.attributes.get('homie_verticalselection').getSelectedOption()
  let isHomieClient = Xrm.Page.data.entity.attributes.get('homie_isthisahomieclient').getValue()
  
  if (referralType){
    if (isHomieClient === true){
      Xrm.Page.ui.controls.get('homie_existingcontact').setVisible(true)
    }
    else {
      Xrm.Page.ui.controls.get('homie_existingcontact').setVisible(false)
    }
    Xrm.Page.ui.controls.get('firstname').setVisible(true)
    Xrm.Page.ui.controls.get('lastname').setVisible(true)
    Xrm.Page.ui.controls.get('mobilephone').setVisible(true)
    Xrm.Page.ui.controls.get('emailaddress1').setVisible(true)
    Xrm.Page.ui.controls.get('homie_market').setVisible(true)
    Xrm.Page.ui.controls.get('subject').setVisible(true)
  }

  else {
    Xrm.Page.ui.controls.get('homie_existingcontact').setVisible(false)
    Xrm.Page.ui.controls.get('firstname').setVisible(false)
    Xrm.Page.ui.controls.get('lastname').setVisible(false)
    Xrm.Page.ui.controls.get('mobilephone').setVisible(false)
    Xrm.Page.ui.controls.get('emailaddress1').setVisible(false)
    Xrm.Page.ui.controls.get('homie_market').setVisible(false)
    Xrm.Page.ui.controls.get('subject').setVisible(false)
  }
}

let updatePipelinePhase = (rowVal, userlcid) => {
  let row = JSON.parse(rowVal)
  console.log(row.stepname)
  // console.log(userlcid)
}