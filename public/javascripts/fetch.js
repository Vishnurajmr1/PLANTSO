const blockUnblockUsers = (userId, currStatus) => {
  const csrfToken = document.querySelector('[name="_csrf"]').value;
  console.log(userId, `${currStatus} hiii`);
  fetch("/admin/blockUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ userId: userId, currStatus: currStatus }),
  })
    .then((res) => {
      // const response = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        throw new Error("An error occured while blocking/unblocking the user.");
      }
    })
    .catch((error) => {
      throw new Error("User blocked operation is on pending");
    });
};

