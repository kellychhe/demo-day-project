const loveIt = document.getElementsByClassName("loveIt");
Array.from(loveIt).forEach(function(element) {
      element.addEventListener('click', function(){
        _id = this.parentNode.parentNode.id
        console.log(_id)
        fetch('loveIt', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            '_id': _id
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

const likeIt = document.getElementsByClassName("likeIt");
Array.from(likeIt).forEach(function(element) {
  element.addEventListener('click', function(){
    _id = this.parentNode.parentNode.id
    fetch('likeIt', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

const hateIt = document.getElementsByClassName("hateIt");
Array.from(hateIt).forEach(function(element) {
  element.addEventListener('click', function(){
    _id = this.parentNode.parentNode.id
    fetch('hateIt', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

const deleteBtn = document.getElementsByClassName("delete");
Array.from(deleteBtn).forEach(function(element) {
      element.addEventListener('click', function(){
        _id = this.parentNode.parentNode.id
        console.log(_id)
        fetch('delete', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            '_id': _id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

const groupMembersButton = document.querySelector('.groupMembersButton')
const groupMembers = document.querySelector('.groupMembers')
const getGroupMembers = (e) => {
	groupMembers.innerHTML = 'loading'
  let groupId = window.location.href.split('/').pop()
  if (window.location.href.split('/').pop() === 'profile'){
    groupId = e.target.parentNode.id || e.target.parentNode.parentNode.id
  }
	fetch(`/getGroupMembers/${groupId}`, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	})
		.then((res) => res.json())
		.then((data) => {
			groupMembers.innerHTML = ''
			data.groupMembers.forEach((member) => {
				const li = document.createElement('li')
				li.textContent = member
				groupMembers.appendChild(li)
			})
		})
} 
groupMembersButton?.addEventListener('click', getGroupMembers)

const deleteGroup = document.querySelectorAll('.bi-trash')
Array.from(deleteGroup).forEach(function(element) {
  element.addEventListener('click', function(){
    _id = this.parentNode.parentNode.parentNode.id
    fetch('deleteGroup', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        '_id': _id
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});
