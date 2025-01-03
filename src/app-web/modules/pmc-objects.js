/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'PMCObj'; // prefix for console.log

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module PMCObj
 * @desc
 * A centralized object factory for model objects.
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCObj = {}; // module object to export

/**
 *  @return {Object} Returns a new classroom data object
 */
PMCObj.Evidence = data => {
  if (data.rsrcId === undefined) throw Error('Evidence requires a rsrcId!');
  return {
    type: 'evidence',
    id: data.id,
    propId: data.propId,
    mechId: data.mechId,
    rsrcId: data.rsrcId,
    numberLabel: data.numberLabel,
    rating: data.rating,
    why: data.why,
    note: data.note,
    imageURL: data.imageURL
  };
};


/**
 *  @return {Object} Returns a new comment data object
 */
PMCObj.Comment = data => {
  if (data.refId === undefined) throw Error('Comment requires a refId!');
  if (data.author === undefined) throw Error('Comment requires an author!');
  return {
    id: data.id,
    refId: data.refId,
    author: data.author,
    date: data.date || new Date(),
    text: data.text || '',
    criteriaId: data.criteriaId || undefined,
    placeholder: data.placeholder
  };
};

/**
 *  @return {Object} Returns a new comment MarkedRead object
 */
PMCObj.MarkedRead = data => {
  if (data.commentId === undefined) throw Error('MarkedRead requires a commentId!');
  if (data.author === undefined) throw Error('MarkedRead requires an author!');
  return {
    id: data.id,
    commentId: data.commentId,
    author: data.author
  };
};

/**
 *  @return {Object} Returns a new urcomment data object
 */
PMCObj.URComment = data => {
  if (data.collection_ref === undefined) throw Error('Comment requires a collection_ref!');
  if (data.commenter_id === undefined) throw Error('Comment requires an commenter_id!');
  return {
    id: data.id, // loki db id, needs to be retained with db data
    collection_ref: data.collection_ref,
    comment_id: data.comment_id,
    comment_id_parent: data.comment_id_parent,
    comment_id_previous: data.comment_id_previous,
    comment_type: data.comment_type,
    comment_createtime: data.comment_createtime,
    comment_modifytime: data.comment_modifytime,
    comment_isMarkedDeleted: data.comment_isMarkedDeleted,
    commenter_id: data.commenter_id,
    commenter_text: data.commenter_text
  };
};

/**
 * @return {Object} Returns a new comment readby object
 */
PMCObj.URCommentReadBy = data => {
  if (data.comment_id === undefined) throw Error('URCommentReadBy requires a comment_id!');
  if (data.commenter_ids === undefined) throw Error('URCommentReadBy requires commenter_ids!');
  return {
    id: data.id, // loki db id, needs to be retained with db data
    comment_id: data.comment_id,
    commenter_ids: data.commenter_ids
  };
}
/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default PMCObj;
