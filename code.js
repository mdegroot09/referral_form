var updateReferralFieldsWithContactInfo = () => {
  var contact = Xrm.Page.data.entity.attributes.get("homie_existingcontact").getValue()

  if (contact){
    return getContactInfo(contact[0].id)
  }

  else {
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
  Xrm.Page.data.entity.attributes.get("firstname").setValue('')
  Xrm.Page.data.entity.attributes.get("lastname").setValue('')
  Xrm.Page.data.entity.attributes.get("mobilephone").setValue('')
  Xrm.Page.data.entity.attributes.get("emailaddress1").setValue('')
  Xrm.Page.data.entity.attributes.get("homie_market").setValue('')
}

var hideAddress2Composites = () => {
  setTimeout(() => {
    // var e = document.querySelector('div[data-id="address2_composite_compositionLinkControl_address2_line1"]')
    var e = document.querySelector('div[data-id="address2_line1"]')
    // var element = document.getElementById('myDivID');
    // var dataID = element.getAttribute('data-id');
    // var e = div[data-id="address2_composite_compositionLinkControl_address2_line1"]
    // var e = $('[data-id="address2_composite_compositionLinkControl_address2_line1"]')
    if (e){
      console.log('element found')
      console.log(e)
    }
    else {
      console.log('element not found')
      console.log(e)
    }
  }, 1000);
}