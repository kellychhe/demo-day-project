const loveIt = document.getElementsByClassName("loveIt");
const likeIt = document.getElementsByClassName("likeIt");
const hateIt = document.getElementsByClassName("hateIt");

const deleteBtn = document.getElementsByClassName("delete");

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
