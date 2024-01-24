"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const favoriteStoryIds = currentUser.favorites.map(story => story.storyId);
  const favoriteImg = favoriteStoryIds.includes(story.storyId) ? "./favorite-filled.png" : "./favorite-outline.png"
  return $(`
      <li id="${story.storyId}">
        <img class="favorite-icon" src="${favoriteImg}" />
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $(".favorite-icon").on('click', async function(evt) {
    console.log("favoriting story...")
    const storyId = $(this).parent().attr('id');
    const isStoryFavorited = currentUser.favorites.map(story => story.storyId).includes(storyId);
    const newImgSrc = isStoryFavorited ? './favorite-outline.png' : './favorite-filled.png';
    $(this).attr('src', newImgSrc);
    console.log($(this))
    await currentUser.favoriteStory(storyId, !isStoryFavorited);
    getAndShowStoriesOnStart();
  });

  $allStoriesList.show();
}

/** Submits a new story */

async function submitStory(evt) {
  console.log("submitStory")
  evt.preventDefault();
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();  

  await storyList.addStory(currentUser, {title, author, url});
  getAndShowStoriesOnStart();
}

$("#story-form").on('submit', submitStory);
